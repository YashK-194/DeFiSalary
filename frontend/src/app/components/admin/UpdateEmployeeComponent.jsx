// components/admin/UpdateEmployeeComponent.jsx
"use client";
import { useState, useEffect } from "react";
import { formatUnits, parseUnits } from "ethers";

const UpdateEmployeeComponent = ({ contract, signer }) => {
  const [employeeAddresses, setEmployeeAddresses] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [formData, setFormData] = useState({
    address: "",
    name: "",
    salary: "",
    paymentDay: "",
  });
  const [loading, setLoading] = useState(false);
  const [fetchingDetails, setFetchingDetails] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch all employee addresses when component mounts
  useEffect(() => {
    const fetchEmployeeAddresses = async () => {
      try {
        const addresses = await contract.getAllEmployeeAddresses();
        setEmployeeAddresses(addresses);
      } catch (err) {
        console.error("Error fetching employee addresses:", err);
        setError("Failed to load employee addresses");
      }
    };

    if (contract) {
      fetchEmployeeAddresses();
    }
  }, [contract]);

  const handleAddressSelect = async (e) => {
    const address = e.target.value;
    if (!address) {
      setSelectedEmployee(null);
      setFormData({
        address: "",
        name: "",
        salary: "",
        paymentDay: "",
      });
      return;
    }

    setFetchingDetails(true);
    setError("");

    try {
      const employeeDetails = await contract.getEmployeeDetails(address);

      // Only allow updating active employees
      if (!employeeDetails.isActive) {
        setError("Selected employee is not active");
        setSelectedEmployee(null);
        setFormData({
          address: "",
          name: "",
          salary: "",
          paymentDay: "",
        });
        return;
      }

      // Format the salary to regular USD (no decimals)
      const formattedSalary = formatUnits(employeeDetails.salaryUSD, 0);

      setSelectedEmployee(employeeDetails);
      setFormData({
        address: address,
        name: employeeDetails.name,
        salary: formattedSalary, // Use the formatted salary value
        paymentDay: employeeDetails.salaryPaymentDay.toString(),
      });
    } catch (err) {
      console.error("Error fetching employee details:", err);
      setError("Failed to load employee details");
      setSelectedEmployee(null);
    } finally {
      setFetchingDetails(false);
    }
  };

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
      const salary = parseFloat(formData.salary);
      if (isNaN(salary) || salary <= 0) {
        throw new Error("Salary must be a positive number");
      }

      const paymentDay = parseInt(formData.paymentDay);
      if (isNaN(paymentDay) || paymentDay <= 0 || paymentDay > 29) {
        throw new Error("Payment day must be between 1 and 29");
      }

      // Convert salary to the correct format (whole number for USD)
      const salaryUSD = parseUnits(formData.salary, 0);

      // Call contract method
      const tx = await contract
        .connect(signer)
        .updateEmployeeDetails(
          formData.address,
          formData.name,
          salaryUSD,
          paymentDay
        );

      await tx.wait();
      setSuccess(`Employee ${formData.name} updated successfully!`);
    } catch (err) {
      console.error("Error updating employee:", err);
      setError(err.message || "Failed to update employee");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-900 rounded-lg p-6">
      <h3 className="text-xl font-semibold text-white mb-4">Update Employee</h3>

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

      <div className="mb-6">
        <label className="block text-gray-300 mb-2">Select Employee</label>
        <select
          onChange={handleAddressSelect}
          className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 focus:outline-none focus:border-yellow-500"
          disabled={fetchingDetails || loading}
        >
          <option value="">-- Select an employee --</option>
          {employeeAddresses.map((address, index) => (
            <option key={index} value={address}>
              {address}
            </option>
          ))}
        </select>
      </div>

      {fetchingDetails && (
        <div className="text-yellow-400 mb-4">Loading employee details...</div>
      )}

      {selectedEmployee && (
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="mb-4">
              <label className="block text-gray-300 mb-2">Employee Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 focus:outline-none focus:border-yellow-500"
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
                  className="w-full bg-gray-700 text-white border border-gray-600 rounded pl-7 px-3 py-2 focus:outline-none focus:border-yellow-500"
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
                className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 focus:outline-none focus:border-yellow-500"
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
              className="bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Processing..." : "Update Employee"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default UpdateEmployeeComponent;
