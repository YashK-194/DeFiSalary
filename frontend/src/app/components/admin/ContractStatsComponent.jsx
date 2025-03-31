import { useState, useEffect } from "react";
import { formatUnits, formatEther } from "ethers";

const ContractStatsComponent = ({ contract, signer }) => {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    totalSalaryPaid: "0",
    ethPrice: "0",
    isLoading: true,
  });

  const [recentPayments, setRecentPayments] = useState([]);
  const [isLoadingPayments, setIsLoadingPayments] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const fetchContractStats = async () => {
      if (!contract) return;

      try {
        const [
          totalEmployeesCount,
          activeEmployeesCount,
          totalSalaryPaidBN,
          ethPriceBN,
        ] = await Promise.all([
          contract.getEmployeeCount(),
          contract.getTotalActiveEmployees(),
          contract.getTotalSalaryPaidUSD(),
          contract.getLatestETHPrice(),
        ]);

        setStats({
          totalEmployees: Number(totalEmployeesCount),
          activeEmployees: Number(activeEmployeesCount),
          totalSalaryPaid: formatUnits(totalSalaryPaidBN, 0),
          ethPrice: formatUnits(ethPriceBN, 18),
          isLoading: false,
        });
      } catch (error) {
        console.error("Error fetching contract stats:", error);
        setStats((prev) => ({ ...prev, isLoading: false }));
      }
    };

    fetchContractStats();
  }, [contract, refreshTrigger]);

  useEffect(() => {
    const fetchPaymentHistory = async () => {
      if (!contract) return;

      setIsLoadingPayments(true);
      try {
        // First get active employees using the contract's dedicated method
        const activeEmployees = await contract.getAllActiveEmployees();
        const inactiveEmployees = await contract.getAllInactiveEmployees();
        const allEmployees = [...activeEmployees, ...inactiveEmployees];

        const allPayments = [];

        // Get payment history for each employee (limit to 20 employees for performance)
        const employeesToProcess = allEmployees.slice(0, 20);

        for (const employee of employeesToProcess) {
          const payments = await contract.getPaymentHistory(
            employee.walletAddress
          );

          // Skip employees with no payment history
          if (payments.length === 0) continue;

          // Add employee info to each payment record
          const formattedPayments = payments.map((payment) => ({
            id: Number(payment.id),
            employeeName: employee.name,
            employeeAddress: employee.walletAddress,
            timestamp: new Date(Number(payment.timestamp) * 1000),
            amountUSD: formatUnits(payment.amountUSD, 0),
            amountETH: formatEther(payment.amountETH),
          }));

          allPayments.push(...formattedPayments);
        }

        // Sort by most recent payments
        allPayments.sort((a, b) => b.timestamp - a.timestamp);

        // Take only the 10 most recent payments
        setRecentPayments(allPayments.slice(0, 10));
      } catch (error) {
        console.error("Error fetching payment history:", error);
      } finally {
        setIsLoadingPayments(false);
      }
    };

    fetchPaymentHistory();
  }, [contract, refreshTrigger]);

  const formatDate = (date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="space-y-6">
      {/* Header with refresh button */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <button
          onClick={handleRefresh}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
              clipRule="evenodd"
            />
          </svg>
          Refresh
        </button>
      </div>

      {/* Contract Stats Overview */}
      <div className="bg-gray-900 rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Contract Statistics</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-blue-700/40 p-4 rounded-lg">
            <p className="text-sm text-blue-300 font-medium">Total Employees</p>
            <p className="text-2xl font-bold">
              {stats.isLoading ? "..." : stats.totalEmployees}
            </p>
          </div>

          <div className="bg-green-700/40 p-4 rounded-lg">
            <p className="text-sm text-green-300 font-medium">
              Active Employees
            </p>
            <p className="text-2xl font-bold">
              {stats.isLoading ? "..." : stats.activeEmployees}
            </p>
          </div>

          <div className="bg-purple-700/40 p-4 rounded-lg">
            <p className="text-sm text-purple-300 font-medium">
              Total Salary Paid (USD)
            </p>
            <p className="text-2xl font-bold">
              {stats.isLoading
                ? "..."
                : `$${Number(stats.totalSalaryPaid).toLocaleString()}`}
            </p>
          </div>

          <div className="bg-amber-700/40 p-4 rounded-lg">
            <p className="text-sm text-amber-300 font-medium">ETH Price</p>
            <p className="text-2xl font-bold">
              {stats.isLoading
                ? "..."
                : `$${parseFloat(stats.ethPrice).toLocaleString(undefined, {
                    maximumFractionDigits: 2,
                  })}`}
            </p>
          </div>
        </div>
      </div>

      {/* Recent Payment History */}
      <div className="bg-gray-900 rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Payments</h2>

        {isLoadingPayments ? (
          <div className="text-center py-8">
            <p className="text-gray-400">Loading payment history...</p>
          </div>
        ) : recentPayments.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400">No payment records found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Amount (USD)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Amount (ETH)
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {recentPayments.map((payment, index) => (
                  <tr
                    key={`${
                      payment.employeeAddress
                    }-${payment.timestamp.getTime()}`}
                    className={index % 2 === 0 ? "bg-gray-800" : "bg-gray-750"}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-white">
                            {payment.employeeName}
                          </div>
                          <div className="text-xs text-gray-400">{`${payment.employeeAddress.substring(
                            0,
                            6
                          )}...${payment.employeeAddress.substring(38)}`}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {formatDate(payment.timestamp)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      ${Number(payment.amountUSD).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {parseFloat(payment.amountETH).toFixed(6)} ETH
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Employee Distribution */}
      <div className="bg-gray-900 rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Employee Distribution</h2>

        <div className="relative pt-1">
          <div className="flex mb-2 items-center justify-between">
            <div>
              <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-green-600 bg-green-200">
                Active
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold inline-block text-green-400">
                {stats.isLoading
                  ? "..."
                  : `${stats.activeEmployees} (${
                      Math.round(
                        (stats.activeEmployees / stats.totalEmployees) * 100
                      ) || 0
                    }%)`}
              </span>
            </div>
          </div>
          <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-green-200/20">
            <div
              style={{
                width: `${
                  stats.isLoading
                    ? 0
                    : (stats.activeEmployees / stats.totalEmployees) * 100 || 0
                }%`,
              }}
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500"
            ></div>
          </div>

          <div className="flex mb-2 items-center justify-between">
            <div>
              <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-red-600 bg-red-200">
                Inactive
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold inline-block text-red-400">
                {stats.isLoading
                  ? "..."
                  : `${stats.totalEmployees - stats.activeEmployees} (${
                      Math.round(
                        ((stats.totalEmployees - stats.activeEmployees) /
                          stats.totalEmployees) *
                          100
                      ) || 0
                    }%)`}
              </span>
            </div>
          </div>
          <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-red-200/20">
            <div
              style={{
                width: `${
                  stats.isLoading
                    ? 0
                    : ((stats.totalEmployees - stats.activeEmployees) /
                        stats.totalEmployees) *
                        100 || 0
                }%`,
              }}
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-red-500"
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractStatsComponent;
