// components/admin/AddEmployeeComponent.jsx
"use client";
import { useState } from "react";
import { isAddress, parseUnits } from "ethers";

const AddEmployeeComponent = ({ contract, signer }) => {
  const [formData, setFormData] = useState({
    address: "",
    name: "",
    salary: "",
    paymentDay: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Validate inputs
      if (!isAddress(formData.address)) {
        throw new Error("Invalid wallet address");
      }

      const salary = parseFloat(formData.salary);
      if (isNaN(salary) || salary <= 0) {
        throw new Error("Salary must be a positive number");
      }

      const paymentDay = parseInt(formData.paymentDay);
      if (isNaN(paymentDay) || paymentDay <= 0 || paymentDay > 29) {
        throw new Error("Payment day must be between 1 and 29");
      }

      // Convert salary to whole USD value (0 decimals)
      const salaryUSD = parseUnits(formData.salary, 0);

      // Call contract method
      const tx = await contract
        .connect(signer)
        .addEmployee(formData.address, formData.name, salaryUSD, paymentDay);

      await tx.wait();
      setSuccess(`Employee ${formData.name} added successfully!`);

      // Clear form
      setFormData({
        address: "",
        name: "",
        salary: "",
        paymentDay: "",
      });
    } catch (err) {
      console.error("Error adding employee:", err);
      setError(err.message || "Failed to add employee");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-900 rounded-lg p-6">
      <h3 className="text-xl font-semibold text-white mb-4">
        Add New Employee
      </h3>

      {error && (
        <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-900/50 border border-green-500 text-green-200 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="mb-4">
            <label className="block text-gray-300 mb-2">Wallet Address</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 focus:outline-none focus:border-purple-500"
              placeholder="0x..."
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-300 mb-2">Employee Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 focus:outline-none focus:border-purple-500"
              placeholder="John Doe"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-300 mb-2">Salary (USD)</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                $
              </span>
              <input
                type="number"
                name="salary"
                value={formData.salary}
                onChange={handleChange}
                className="w-full bg-gray-700 text-white border border-gray-600 rounded pl-7 px-3 py-2 focus:outline-none focus:border-purple-500"
                placeholder="5000"
                step="1"
                min="1"
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-gray-300 mb-2">
              Payment Day (1-29)
            </label>
            <input
              type="number"
              name="paymentDay"
              value={formData.paymentDay}
              onChange={handleChange}
              className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 focus:outline-none focus:border-purple-500"
              placeholder="15"
              min="1"
              max="29"
              required
            />
          </div>
        </div>

        <div className="mt-6">
          <button
            type="submit"
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Processing..." : "Add Employee"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddEmployeeComponent;
