// components/admin/RemoveEmployeeComponent.jsx
"use client";
import { useState, useEffect } from "react";

const RemoveEmployeeComponent = ({ contract, signer }) => {
  const [employees, setEmployees] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [employeeDetails, setEmployeeDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchingDetails, setFetchingDetails] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch active employees when component mounts
  useEffect(() => {
    const fetchActiveEmployees = async () => {
      try {
        const activeEmployees = await contract.getAllActiveEmployees();
        setEmployees(activeEmployees);
      } catch (err) {
        console.error("Error fetching active employees:", err);
        setError("Failed to load active employees");
      }
    };

    if (contract) {
      fetchActiveEmployees();
    }
  }, [contract]);

  const handleEmployeeSelect = async (e) => {
    const address = e.target.value;
    setSelectedAddress(address);

    if (!address) {
      setEmployeeDetails(null);
      return;
    }

    setFetchingDetails(true);
    setError("");

    try {
      const details = await contract.getEmployeeDetails(address);
      setEmployeeDetails(details);
    } catch (err) {
      console.error("Error fetching employee details:", err);
      setError("Failed to load employee details");
      setEmployeeDetails(null);
    } finally {
      setFetchingDetails(false);
    }
  };

  const handleRemoveEmployee = async () => {
    if (!selectedAddress || !employeeDetails) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const tx = await contract.connect(signer).removeEmployee(selectedAddress);
      await tx.wait();

      setSuccess(`Employee ${employeeDetails.name} removed successfully!`);

      // Refresh employee list
      const activeEmployees = await contract.getAllActiveEmployees();
      setEmployees(activeEmployees);

      // Reset selection
      setSelectedAddress("");
      setEmployeeDetails(null);
    } catch (err) {
      console.error("Error removing employee:", err);
      setError(err.message || "Failed to remove employee");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-900 rounded-lg p-6">
      <h3 className="text-xl font-semibold text-white mb-4">Remove Employee</h3>

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
        <label className="block text-gray-300 mb-2">
          Select Employee to Remove
        </label>
        <select
          value={selectedAddress}
          onChange={handleEmployeeSelect}
          className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 focus:outline-none focus:border-red-500"
          disabled={loading || fetchingDetails}
        >
          <option value="">-- Select an employee --</option>
          {employees.map((employee, index) => (
            <option key={index} value={employee.walletAddress}>
              {employee.name} ({employee.walletAddress})
            </option>
          ))}
        </select>
      </div>

      {fetchingDetails && (
        <div className="text-yellow-400 mb-4">Loading employee details...</div>
      )}

      {employeeDetails && (
        <div className="bg-gray-800 rounded-lg p-4 mb-6">
          <h4 className="text-lg font-medium text-white mb-3">
            Employee Details
          </h4>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            <div className="text-gray-400">
              ID:{" "}
              <span className="text-white">
                {employeeDetails.id.toString()}
              </span>
            </div>
            <div className="text-gray-400">
              Name: <span className="text-white">{employeeDetails.name}</span>
            </div>
            <div className="text-gray-400">
              Wallet:{" "}
              <span className="text-white">
                {employeeDetails.walletAddress}
              </span>
            </div>
            <div className="text-gray-400">
              Payment Day:{" "}
              <span className="text-white">
                {employeeDetails.salaryPaymentDay.toString()}
              </span>
            </div>
          </div>

          <div className="mt-4 p-3 bg-red-900/30 border border-red-800 rounded-lg">
            <p className="text-red-300 text-sm">
              Warning: Removing an employee cannot be undone. They will be
              marked as inactive in the system.
            </p>
          </div>

          <div className="mt-4">
            <button
              onClick={handleRemoveEmployee}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Processing..." : "Remove Employee"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RemoveEmployeeComponent;
