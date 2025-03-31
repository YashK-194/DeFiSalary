// components/admin/ContractBalanceComponent.jsx
"use client";
import { useState, useEffect } from "react";
import { ethers } from "ethers";

const ContractBalanceComponent = ({ contract, signer }) => {
  const [balance, setBalance] = useState(null);
  const [ethPrice, setEthPrice] = useState(null);
  const [depositAmount, setDepositAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchContractBalance = async () => {
    setRefreshing(true);
    try {
      const provider = signer.provider;
      const contractAddress = await contract.getAddress();
      const balanceWei = await provider.getBalance(contractAddress);
      setBalance(balanceWei);

      // Get ETH price from contract
      const ethPriceValue = await contract.getLatestETHPrice();
      setEthPrice(ethPriceValue);
    } catch (err) {
      console.error("Error fetching contract balance:", err);
      setError("Failed to fetch contract balance");
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (contract && signer) {
      fetchContractBalance();
    }
  }, [contract, signer]);

  const handleDeposit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const amount = ethers.parseEther(depositAmount);

      // Send ETH to contract
      const tx = await signer.sendTransaction({
        to: await contract.getAddress(),
        value: amount,
      });

      await tx.wait();
      setSuccess(`Successfully deposited ${depositAmount} ETH to the contract`);
      setDepositAmount("");

      // Refresh balance
      fetchContractBalance();
    } catch (err) {
      console.error("Error depositing ETH:", err);
      setError(err.message || "Failed to deposit ETH");
    } finally {
      setLoading(false);
    }
  };

  const formatBalance = (balanceWei) => {
    if (!balanceWei) return "0";
    return ethers.formatEther(balanceWei);
  };

  const calculateUsdValue = (balanceWei) => {
    if (!balanceWei || !ethPrice) return "0";
    const balanceEth = parseFloat(ethers.formatEther(balanceWei));
    const ethPriceUsd = parseFloat(ethers.formatUnits(ethPrice, 18));
    return (balanceEth * ethPriceUsd).toFixed(2);
  };

  return (
    <div className="bg-gray-900 rounded-lg p-6">
      <h3 className="text-xl font-semibold text-white mb-4">
        Contract Balance
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

      <div className="bg-gray-800 rounded-lg p-5 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h4 className="text-gray-400 mb-1">Current Balance</h4>
            <div className="flex items-baseline">
              <span className="text-3xl font-bold text-blue-400">
                {balance ? formatBalance(balance) : "..."}
              </span>
              <span className="ml-1 text-xl text-gray-500">ETH</span>
            </div>
            {ethPrice && (
              <div className="text-gray-400 mt-1">
                ≈ ${calculateUsdValue(balance)} USD
              </div>
            )}
          </div>

          <button
            onClick={fetchContractBalance}
            disabled={refreshing}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
          >
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-5">
        <h4 className="text-lg font-medium text-white mb-3">
          Deposit ETH to Contract
        </h4>
        <form onSubmit={handleDeposit}>
          <div className="mb-4">
            <label className="block text-gray-300 mb-2" htmlFor="depositAmount">
              Amount (ETH)
            </label>
            <input
              id="depositAmount"
              type="number"
              step="0.01"
              min="0"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:outline-none focus:border-blue-500"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm disabled:opacity-50"
          >
            {loading ? "Processing..." : "Deposit"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ContractBalanceComponent;
