"use client";
import { useState, useEffect, useRef } from "react";
import { ethers } from "ethers";
import contractAddresses from "./constants/ContractAddresses.json";
import ContractABI from "./constants/DefisalaryABI.json";
import ConnectButton from "./components/ConnectButton";
import EmployeeManagementComponent from "./components/EmployeeManagementComponent";
import AdminPanelComponent from "./components/AdminPanelComponent";

export default function Home() {
  const [account, setAccount] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [network, setNetwork] = useState("sepolia");
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeComponent, setActiveComponent] = useState(null); // Track open popup

  const getContractAddress = (networkName) => {
    return contractAddresses[networkName]?.DefisalaryContract || null;
  };

  const CONTRACT_ADDRESS = getContractAddress(network);

  const connectWallet = async () => {
    setIsLoading(true);
    try {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });

        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();

        setProvider(provider);
        setSigner(signer);
        setAccount(accounts[0]);
      } else {
        alert("MetaMask is required to connect");
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (signer && CONTRACT_ADDRESS) {
      const contractInstance = new ethers.Contract(
        CONTRACT_ADDRESS,
        ContractABI,
        signer
      );
      setContract(contractInstance);

      const checkIfAdmin = async () => {
        try {
          const owner = await contractInstance.owner();
          setIsAdmin(owner.toLowerCase() === account?.toLowerCase());
        } catch (error) {
          console.error("Error checking admin status:", error);
          setIsAdmin(false);
        }
      };

      checkIfAdmin();
    }
  }, [signer, CONTRACT_ADDRESS, account]);

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          console.log("Account changed:", accounts[0]);
        } else {
          setAccount(null);
        }
      });

      window.ethereum.on("chainChanged", () => {
        window.location.reload();
      });
    }
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex flex-1">
        {/* Sidebar Navigation */}
        <nav className="w-64 bg-gray-900 text-white p-6">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600 mb-6">
            DefiSalary
          </h1>

          <ul className="space-y-4">
            <li>
              <button
                className={`w-full text-left p-2 rounded ${
                  activeComponent === "employeeManagement" ? "bg-gray-700" : ""
                }`}
                onClick={() => setActiveComponent("employeeManagement")}
              >
                Employee Management
              </button>
            </li>
            <li>
              <button
                className={`w-full text-left p-2 rounded ${
                  activeComponent === "adminPanel" ? "bg-gray-700" : ""
                }`}
                onClick={() => setActiveComponent("adminPanel")}
              >
                Admin Panel
              </button>
            </li>
          </ul>
        </nav>

        {/* Main Content */}
        <div className="flex-1 p-6 flex flex-col">
          <header className="flex justify-between items-center mb-6">
            <div className="max-w-md">
              <p className="text-sm md:text-base font-medium text-gray-300">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                  Crypto payroll and employee management
                </span>{" "}
                with automated, secure payments
              </p>
            </div>
            <ConnectButton
              connect={connectWallet}
              account={account}
              isLoading={isLoading}
              network={network}
            />
          </header>

          <div className="flex-1">
            {account ? (
              <>
                {activeComponent === "employeeManagement" && (
                  <EmployeeManagementComponent
                    contract={contract}
                    signer={signer}
                  />
                )}
                {activeComponent === "adminPanel" && (
                  <AdminPanelComponent contract={contract} signer={signer} />
                )}
              </>
            ) : (
              <div className="text-center bg-gray-800 p-8 rounded-xl">
                Please connect your wallet to continue
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-4 bg-gray-900 text-white text-center border-t border-gray-800">
        <div className="container mx-auto">
          Developed and maintained by Yash Kumar
          <br />
          <a
            href="https://www.linkedin.com/in/yashk194"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:underline ml-1"
          >
            linkedin.com/in/yashk194
          </a>
        </div>
      </footer>
    </div>
  );
}
