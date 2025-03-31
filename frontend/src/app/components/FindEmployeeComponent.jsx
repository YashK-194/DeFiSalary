"use client";
import { useState, useEffect } from "react";

const FindEmployeeComponent = ({ contract }) => {
  const [employeeId, setEmployeeId] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [employeeAddress, setEmployeeAddress] = useState(null);
  const [employeeDetails, setEmployeeDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchEmployeeAddress = async () => {
    if (!employeeId) return;
    setLoading(true);
    setError(null);
    try {
      const address = await contract.getEmployeeAddress(employeeId);
      setEmployeeAddress(address);
    } catch (err) {
      console.error("Failed to fetch employee address:", err);
      setError("Employee not found. Please check the ID.");
    }
    setLoading(false);
  };

  const fetchEmployeeDetails = async () => {
    if (!employeeAddress) return;
    setLoading(true);
    setError(null);
    try {
      const details = await contract.getEmployeeDetails(employeeAddress);
      setEmployeeDetails(details);
    } catch (err) {
      console.error("Failed to fetch employee details:", err);
      setError("Could not retrieve employee details.");
    }
    setLoading(false);
  };

  const handleWalletSearch = async () => {
    if (!walletAddress) return;
    setLoading(true);
    setError(null);
    try {
      // Set the employee address directly from the wallet input
      setEmployeeAddress(walletAddress);

      // Then fetch details using this address
      const details = await contract.getEmployeeDetails(walletAddress);
      setEmployeeDetails(details);
    } catch (err) {
      console.error("Failed to fetch employee details:", err);
      setError("Could not retrieve employee details for this wallet address.");
    }
    setLoading(false);
  };

  // Function to format Unix timestamp to human-readable date
  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    try {
      // Convert BigInt to Number safely
      const timestampNumber =
        typeof timestamp === "bigint"
          ? Number(timestamp)
          : Number(timestamp.toString());

      const date = new Date(timestampNumber * 1000);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (err) {
      console.error("Date formatting error:", err);
      return "Invalid Date";
    }
  };

  // Open Etherscan for the wallet address
  const openEtherscan = (address) => {
    window.open(`https://sepolia.etherscan.io/address/${address}`, "_blank");
  };

  // Lock body scroll when modal is open
  useEffect(() => {
    if (employeeDetails) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [employeeDetails]);

  return (
    <div className="mb-6">
      <h3 className="text-xl font-bold text-white mb-4">Find Employee</h3>
      <div className="flex gap-4">
        <input
          type="number"
          className="px-4 py-2 rounded bg-gray-800 text-white border border-gray-600 focus:outline-none"
          placeholder="Enter Employee ID"
          value={employeeId}
          onChange={(e) => setEmployeeId(e.target.value)}
        />
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-200"
          onClick={fetchEmployeeAddress}
          disabled={loading}
        >
          {loading ? "Searching..." : "Find"}
        </button>
      </div>
      or
      <div className="flex gap-4">
        <input
          type="text"
          className="px-4 py-2 rounded bg-gray-800 text-white border border-gray-600 focus:outline-none"
          placeholder="Enter Wallet Address"
          value={walletAddress}
          onChange={(e) => setWalletAddress(e.target.value)}
        />
        <button
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition duration-200"
          onClick={handleWalletSearch}
          disabled={loading}
        >
          {loading ? "Fetching..." : "Find by Wallet Address"}
        </button>
      </div>
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-xl mt-4">
          <p>{error}</p>
        </div>
      )}
      {employeeAddress && (
        <div className="mt-4 p-4 bg-gray-800 rounded-xl">
          <p className="text-white">
            Employee Address:{" "}
            <span className="font-mono">{employeeAddress}</span>
          </p>
          <button
            className="mt-2 px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition duration-200"
            onClick={fetchEmployeeDetails}
          >
            View Details
          </button>
        </div>
      )}
      {employeeDetails && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50 p-4">
          <div className="bg-gray-900 rounded-xl w-full max-w-2xl text-white shadow-2xl border border-gray-700 overflow-hidden">
            <div className="p-6 bg-gray-800">
              <div className="flex justify-between items-center">
                <h4 className="text-2xl font-bold">Employee Details</h4>
                <button
                  onClick={() => setEmployeeDetails(null)}
                  className="p-1 rounded-full hover:bg-gray-700 transition duration-200"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-3 gap-4 items-center">
                <div className="font-semibold text-gray-400">Name</div>
                <div className="col-span-2 font-medium">
                  {employeeDetails.name}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 items-center">
                <div className="font-semibold text-gray-400">Employee ID</div>
                <div className="col-span-2 font-medium">
                  {employeeDetails.id.toString()}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 items-center">
                <div className="font-semibold text-gray-400">
                  Wallet Address
                </div>
                <div className="col-span-2 font-mono text-sm break-all">
                  {employeeDetails.walletAddress}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 items-center">
                <div className="col-span-1"></div>
                <div className="col-span-2">
                  <button
                    onClick={() => openEtherscan(employeeDetails.walletAddress)}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition duration-200 flex items-center"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                    View on Etherscan
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 items-center">
                <div className="font-semibold text-gray-400">Salary</div>
                <div className="col-span-2 font-medium">
                  <span className="text-green-400">
                    ${employeeDetails.salaryUSD.toString()}
                  </span>{" "}
                  USD
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 items-center">
                <div className="font-semibold text-gray-400">
                  Date of Joining
                </div>
                <div className="col-span-2 font-medium">
                  {formatDate(employeeDetails.dateOfJoining)}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 items-center">
                <div className="font-semibold text-gray-400">
                  Salary Payment Date
                </div>
                <div className="col-span-2 font-medium">
                  {(
                    employeeDetails.salaryPaymentDate ||
                    employeeDetails.salaryDate ||
                    employeeDetails.salaryUSD
                  ).toString()}{" "}
                  of every month
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 items-center">
                <div className="font-semibold text-gray-400">Status</div>
                <div className="col-span-2">
                  {employeeDetails.isActive ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Inactive
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 bg-gray-800 flex justify-end">
              <button
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition duration-200"
                onClick={() => setEmployeeDetails(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FindEmployeeComponent;
