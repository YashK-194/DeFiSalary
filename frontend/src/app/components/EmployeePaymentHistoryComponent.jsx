"use client";
import { useState, useEffect } from "react";

const EmployeePaymentHistoryComponent = ({ contract }) => {
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [employeeAddress, setEmployeeAddress] = useState("");

  const setEmpWalletAddress = (address) => {
    setEmployeeAddress(address);
  };

  const fetchPaymentHistory = async () => {
    if (!employeeAddress) return;
    setLoading(true);
    setError(null);
    try {
      const history = await contract.getPaymentHistory(employeeAddress);
      setPaymentHistory(history);
      setIsOpen(true);
    } catch (err) {
      console.error("Failed to fetch payment history:", err);
      setError("Could not retrieve payment history for this employee.");
    }
    setLoading(false);
  };

  // Format timestamp to human-readable date
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
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (err) {
      console.error("Date formatting error:", err);
      return "Invalid Date";
    }
  };

  // Format ETH with 6 decimal places max
  const formatETH = (amount) => {
    if (!amount) return "0";
    try {
      const value =
        typeof amount === "bigint" ? amount : BigInt(amount.toString());

      // Convert wei to ETH (1 ETH = 10^18 wei)
      const ethValue = Number(value) / 1e18;
      return ethValue.toFixed(6);
    } catch (err) {
      console.error("ETH formatting error:", err);
      return "0";
    }
  };

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  return (
    <div>
      <input
        type="text"
        className="px-4 py-2 rounded bg-gray-800 text-white border border-gray-600 focus:outline-none"
        placeholder="Enter Wallet Address"
        value={employeeAddress}
        onChange={(e) => setEmpWalletAddress(e.target.value)}
      />
      <button
        className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 transition duration-200"
        onClick={fetchPaymentHistory}
        disabled={loading || !employeeAddress}
      >
        {loading ? "Loading..." : "View Payment History"}
      </button>

      {error && (
        <div className="mt-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-xl">
          <p>{error}</p>
        </div>
      )}

      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50 p-4">
          <div className="bg-gray-900 rounded-xl w-full max-w-3xl text-white shadow-2xl border border-gray-700 overflow-hidden">
            <div className="p-6 bg-gray-800">
              <div className="flex justify-between items-center">
                <h4 className="text-2xl font-bold">Payment History</h4>
                <button
                  onClick={() => setIsOpen(false)}
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

            <div className="p-6">
              {paymentHistory.length === 0 ? (
                <div className="text-center p-6 bg-gray-800 rounded-lg">
                  <p className="text-gray-400">
                    No payment records found for this employee.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs uppercase bg-gray-800">
                      <tr>
                        <th className="px-6 py-3 rounded-tl-lg">ID</th>
                        <th className="px-6 py-3">Date</th>
                        <th className="px-6 py-3">Amount (USD)</th>
                        <th className="px-6 py-3 rounded-tr-lg">
                          Amount (ETH)
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {paymentHistory.map((payment, index) => (
                        <tr
                          key={index}
                          className="bg-gray-800 border-b border-gray-700 hover:bg-gray-700"
                        >
                          <td className="px-6 py-4 font-medium">
                            {payment.id.toString()}
                          </td>
                          <td className="px-6 py-4">
                            {formatDate(payment.timestamp)}
                          </td>
                          <td className="px-6 py-4 text-green-400">
                            ${payment.amountUSD.toString()}
                          </td>
                          <td className="px-6 py-4 text-purple-400">
                            {formatETH(payment.amountETH)} ETH
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="text-xs uppercase bg-gray-800">
                      <tr>
                        <th className="px-6 py-3 rounded-bl-lg" colSpan="2">
                          Total Payments
                        </th>
                        <th className="px-6 py-3 text-green-400">
                          $
                          {paymentHistory.reduce(
                            (sum, payment) =>
                              sum + Number(payment.amountUSD.toString()),
                            0
                          )}
                        </th>
                        <th className="px-6 py-3 text-purple-400 rounded-br-lg">
                          {paymentHistory
                            .reduce(
                              (sum, payment) =>
                                sum + Number(formatETH(payment.amountETH)),
                              0
                            )
                            .toFixed(6)}{" "}
                          ETH
                        </th>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>

            <div className="p-6 bg-gray-800 flex justify-end">
              <button
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition duration-200"
                onClick={() => setIsOpen(false)}
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

export default EmployeePaymentHistoryComponent;
