// components/EmployeeManagementComponent.jsx
"use client";
import { useState } from "react";
import ActiveEmployeesComponent from "./ActiveEmployeesComponent";
import InactiveEmployeesComponent from "./InactiveEmployeesComponent";
import EmployeeAddressesComponent from "./EmployeeAddressesComponent";
import FindEmployeeComponent from "./FindEmployeeComponent";
import EmployeePaymentHistoryComponent from "./EmployeePaymentHistoryComponent";

const EmployeeManagementComponent = ({ contract }) => {
  const [activeTab, setActiveTab] = useState("active");

  return (
    <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden">
      <div className="p-6 border-b border-gray-700">
        <h2 className="text-2xl font-bold text-white">Employee Management</h2>
      </div>

      <div className="bg-gray-900 px-6 pt-4">
        <div className="flex border-b border-gray-700">
          <button
            className={`py-2 px-4 font-medium ${
              activeTab === "active"
                ? "text-purple-500 border-b-2 border-purple-500"
                : "text-gray-400 hover:text-white"
            }`}
            onClick={() => setActiveTab("active")}
          >
            Active Employees
          </button>
          <button
            className={`py-2 px-4 font-medium ${
              activeTab === "inactive"
                ? "text-purple-500 border-b-2 border-purple-500"
                : "text-gray-400 hover:text-white"
            }`}
            onClick={() => setActiveTab("inactive")}
          >
            Inactive Employees
          </button>
          <button
            className={`py-2 px-4 font-medium ${
              activeTab === "addresses"
                ? "text-purple-500 border-b-2 border-purple-500"
                : "text-gray-400 hover:text-white"
            }`}
            onClick={() => setActiveTab("addresses")}
          >
            All Employee Addresses
          </button>
          <button
            className={`py-2 px-4 font-medium ${
              activeTab === "findEmployee"
                ? "text-purple-500 border-b-2 border-purple-500"
                : "text-gray-400 hover:text-white"
            }`}
            onClick={() => setActiveTab("findEmployee")}
          >
            Find Employee
          </button>

          <button
            className={`py-2 px-4 font-medium ${
              activeTab === "paymentHistory"
                ? "text-purple-500 border-b-2 border-purple-500"
                : "text-gray-400 hover:text-white"
            }`}
            onClick={() => setActiveTab("paymentHistory")}
          >
            Fetch Payment History
          </button>
        </div>
      </div>

      <div className="p-6">
        {activeTab === "active" && (
          <ActiveEmployeesComponent contract={contract} />
        )}
        {activeTab === "inactive" && (
          <div className="text-gray-300">
            <InactiveEmployeesComponent contract={contract} />
          </div>
        )}
        {activeTab === "addresses" && (
          <div className="text-gray-300">
            <EmployeeAddressesComponent contract={contract} />
          </div>
        )}
        {activeTab === "findEmployee" && (
          <div className="text-gray-300">
            <FindEmployeeComponent contract={contract} />
          </div>
        )}
        {activeTab === "paymentHistory" && (
          <div className="text-gray-300">
            <EmployeePaymentHistoryComponent contract={contract} />
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeManagementComponent;
