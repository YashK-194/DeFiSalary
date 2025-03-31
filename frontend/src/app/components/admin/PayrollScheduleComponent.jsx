import { useState, useEffect } from "react";
import { formatUnits } from "ethers";

const PayrollScheduleComponent = ({ contract }) => {
  const [upcomingPayments, setUpcomingPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [totalMonthlyPayroll, setTotalMonthlyPayroll] = useState("0");

  useEffect(() => {
    const fetchEmployees = async () => {
      if (!contract) return;

      setIsLoading(true);
      try {
        const activeEmployees = await contract.getAllActiveEmployees();

        // Calculate the next payment date for each employee
        const today = new Date();
        const currentDay = today.getDate();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();

        let monthlyPayrollTotal = 0;

        const payments = activeEmployees.map((employee) => {
          const paymentDay = Number(employee.salaryPaymentDay);
          const salaryUSD = Number(formatUnits(employee.salaryUSD, 0));
          monthlyPayrollTotal += salaryUSD;

          // Determine next payment date
          let nextPaymentDate;
          if (paymentDay >= currentDay) {
            // Payment is later this month
            nextPaymentDate = new Date(currentYear, currentMonth, paymentDay);
          } else {
            // Payment is next month
            nextPaymentDate = new Date(
              currentYear,
              currentMonth + 1,
              paymentDay
            );
          }

          // Calculate days until next payment
          const daysUntilPayment = Math.ceil(
            (nextPaymentDate - today) / (1000 * 60 * 60 * 24)
          );

          return {
            id: Number(employee.id),
            name: employee.name,
            address: employee.walletAddress,
            paymentDate: nextPaymentDate,
            salaryUSD: salaryUSD,
            daysUntilPayment: daysUntilPayment,
          };
        });

        // Sort by upcoming payment date (ascending)
        const sortedPayments = payments.sort(
          (a, b) => a.paymentDate.getTime() - b.paymentDate.getTime()
        );

        setUpcomingPayments(sortedPayments);
        setTotalMonthlyPayroll(monthlyPayrollTotal.toString());
      } catch (error) {
        console.error("Error fetching employee payment schedule:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmployees();
  }, [contract, refreshTrigger]);

  const formatDate = (date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  };

  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  // Group payments by week
  const groupPaymentsByWeek = () => {
    const grouped = {};
    const today = new Date();

    // Create week buckets
    grouped["This Week"] = [];
    grouped["Next Week"] = [];
    grouped["Later This Month"] = [];
    grouped["Next Month"] = [];

    upcomingPayments.forEach((payment) => {
      const daysUntil = payment.daysUntilPayment;

      if (daysUntil < 7) {
        grouped["This Week"].push(payment);
      } else if (daysUntil < 14) {
        grouped["Next Week"].push(payment);
      } else if (payment.paymentDate.getMonth() === today.getMonth()) {
        grouped["Later This Month"].push(payment);
      } else {
        grouped["Next Month"].push(payment);
      }
    });

    return grouped;
  };

  const paymentGroups = groupPaymentsByWeek();

  return (
    <div className="space-y-6">
      {/* Header with refresh button */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Upcoming Payments</h1>
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

      {/* Monthly Payroll Summary */}
      <div className="bg-gray-900 rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Monthly Payroll Summary</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-purple-700/40 p-4 rounded-lg">
            <p className="text-sm text-purple-300 font-medium">
              Total Monthly Payroll
            </p>
            <p className="text-2xl font-bold">
              {isLoading
                ? "..."
                : `$${Number(totalMonthlyPayroll).toLocaleString()}`}
            </p>
          </div>

          <div className="bg-green-700/40 p-4 rounded-lg">
            <p className="text-sm text-green-300 font-medium">
              Upcoming Payments (7 days)
            </p>
            <p className="text-2xl font-bold">
              {isLoading ? "..." : paymentGroups["This Week"].length}
            </p>
          </div>

          <div className="bg-blue-700/40 p-4 rounded-lg">
            <p className="text-sm text-blue-300 font-medium">Total Employees</p>
            <p className="text-2xl font-bold">
              {isLoading ? "..." : upcomingPayments.length}
            </p>
          </div>
        </div>
      </div>

      {/* Payment Schedule */}
      {Object.keys(paymentGroups).map(
        (groupName) =>
          paymentGroups[groupName].length > 0 && (
            <div
              key={groupName}
              className="bg-gray-900 rounded-2xl shadow-lg p-6"
            >
              <h2 className="text-xl font-semibold mb-4">{groupName}</h2>

              {isLoading ? (
                <div className="text-center py-8">
                  <p className="text-gray-400">Loading payment schedule...</p>
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
                          Payment Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Days Until
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Amount (USD)
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-gray-800 divide-y divide-gray-700">
                      {paymentGroups[groupName].map((payment, index) => (
                        <tr
                          key={payment.id}
                          className={
                            index % 2 === 0 ? "bg-gray-800" : "bg-gray-750"
                          }
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div>
                                <div className="text-sm font-medium text-white">
                                  {payment.name}
                                </div>
                                <div className="text-xs text-gray-400">{`${payment.address.substring(
                                  0,
                                  6
                                )}...${payment.address.substring(38)}`}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                            {formatDate(payment.paymentDate)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                            ${
                              payment.daysUntilPayment <= 3
                                ? "bg-red-100 text-red-800"
                                : payment.daysUntilPayment <= 7
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-green-100 text-green-800"
                            }`}
                            >
                              {payment.daysUntilPayment}{" "}
                              {payment.daysUntilPayment === 1 ? "day" : "days"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                            ${payment.salaryUSD.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )
      )}

      {/* No upcoming payments message */}
      {upcomingPayments.length === 0 && !isLoading && (
        <div className="bg-gray-900 rounded-2xl shadow-lg p-6 text-center">
          <p className="text-gray-400 py-8">No upcoming payments scheduled</p>
        </div>
      )}
    </div>
  );
};

export default PayrollScheduleComponent;
