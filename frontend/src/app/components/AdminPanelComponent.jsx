// components/AdminPanelComponent.jsx
"use client";
import { useState, useEffect } from "react";
import AddEmployeeComponent from "./admin/AddEmployeeComponent";
import UpdateEmployeeComponent from "./admin/UpdateEmployeeComponent";
import RemoveEmployeeComponent from "./admin/RemoveEmployeeComponent";
import ContractBalanceComponent from "./admin/ContractBalanceComponent";
import ContractStatsComponent from "./admin/ContractStatsComponent";
import PayrollScheduleComponent from "./admin/PayrollScheduleComponent";

const AdminPanelComponent = ({ contract, signer }) => {
  const [isOwner, setIsOwner] = useState(false);
  const [activeTab, setActiveTab] = useState("add");

  // Check if current user is the contract owner
  useEffect(() => {
    const checkOwnership = async () => {
      try {
        const owner = await contract.owner();
        const signerAddress = await signer.getAddress();
        setIsOwner(owner.toLowerCase() === signerAddress.toLowerCase());
      } catch (error) {
        console.error("Error checking contract ownership:", error);
        setIsOwner(false);
      }
    };

    if (contract && signer) {
      checkOwnership();
    }
  }, [contract, signer]);

  // If not owner, show access denied
  if (!isOwner) {
    return (
      <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white">Admin Panel</h2>
        </div>
        <div className="p-10 flex flex-col items-center justify-center text-center">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h3 className="text-xl font-bold text-red-500 mb-2">Access Denied</h3>
          <p className="text-gray-400">
            Only the contract owner can access the admin panel. <br />
            You can see the functions available to the owner in the screenshots.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden">
      <div className="p-6 border-b border-gray-700">
        <h2 className="text-2xl font-bold text-white">Admin Panel</h2>
        <p className="text-sm text-gray-400 mt-1">
          Manage employees and contract settings
        </p>
      </div>

      <div className="bg-gray-900 px-6 pt-4">
        <div className="flex flex-wrap border-b border-gray-700">
          <button
            className={`py-2 px-4 font-medium ${
              activeTab === "add"
                ? "text-green-500 border-b-2 border-green-500"
                : "text-gray-400 hover:text-white"
            }`}
            onClick={() => setActiveTab("add")}
          >
            Add Employee
          </button>
          <button
            className={`py-2 px-4 font-medium ${
              activeTab === "update"
                ? "text-yellow-500 border-b-2 border-yellow-500"
                : "text-gray-400 hover:text-white"
            }`}
            onClick={() => setActiveTab("update")}
          >
            Update Employee
          </button>
          <button
            className={`py-2 px-4 font-medium ${
              activeTab === "remove"
                ? "text-red-500 border-b-2 border-red-500"
                : "text-gray-400 hover:text-white"
            }`}
            onClick={() => setActiveTab("remove")}
          >
            Remove Employee
          </button>
          <button
            className={`py-2 px-4 font-medium ${
              activeTab === "balance"
                ? "text-blue-500 border-b-2 border-blue-500"
                : "text-gray-400 hover:text-white"
            }`}
            onClick={() => setActiveTab("balance")}
          >
            Contract Balance
          </button>
          <button
            className={`py-2 px-4 font-medium ${
              activeTab === "stats"
                ? "text-purple-500 border-b-2 border-purple-500"
                : "text-gray-400 hover:text-white"
            }`}
            onClick={() => setActiveTab("stats")}
          >
            Contract Stats
          </button>
          <button
            className={`py-2 px-4 font-medium ${
              activeTab === "schedule"
                ? "text-teal-500 border-b-2 border-teal-500"
                : "text-gray-400 hover:text-white"
            }`}
            onClick={() => setActiveTab("schedule")}
          >
            Payroll Schedule
          </button>
        </div>
      </div>

      <div className="p-6">
        {activeTab === "add" && (
          <AddEmployeeComponent contract={contract} signer={signer} />
        )}
        {activeTab === "update" && (
          <UpdateEmployeeComponent contract={contract} signer={signer} />
        )}
        {activeTab === "remove" && (
          <RemoveEmployeeComponent contract={contract} signer={signer} />
        )}
        {activeTab === "balance" && (
          <ContractBalanceComponent contract={contract} signer={signer} />
        )}
        {activeTab === "stats" && (
          <ContractStatsComponent contract={contract} signer={signer} />
        )}
        {activeTab === "schedule" && (
          <PayrollScheduleComponent contract={contract} signer={signer} />
        )}
      </div>
    </div>
  );
};

export default AdminPanelComponent;
