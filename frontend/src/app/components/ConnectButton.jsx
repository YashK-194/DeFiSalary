"use client";
import { useState, useEffect } from "react";

const ConnectButton = ({ connect, account, isLoading, network }) => {
  // Format account address for display (truncate middle)
  const formatAddress = (address) => {
    if (!address) return "";
    return `${address.substring(0, 6)}...${address.substring(
      address.length - 4
    )}`;
  };

  // Get network display name
  const getNetworkName = () => {
    if (!network) return "";

    // Capitalize first letter
    return network.charAt(0).toUpperCase() + network.slice(1);
  };

  return (
    <div className="flex flex-col sm:flex-row items-center gap-3">
      {account && (
        <div className="bg-gray-800 text-gray-300 px-4 py-2 rounded-lg text-sm border border-gray-700">
          <span className="mr-2">Network:</span>
          <span className="text-purple-400 font-medium">
            {getNetworkName()}
          </span>
        </div>
      )}

      <button
        onClick={connect}
        disabled={isLoading || account}
        className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
          account
            ? "bg-green-900/50 text-green-400 border border-green-700"
            : "bg-purple-600 hover:bg-purple-700 text-white"
        } ${isLoading ? "opacity-70 cursor-not-allowed" : ""}`}
      >
        {isLoading ? (
          <div className="flex items-center justify-center">
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Connecting...
          </div>
        ) : account ? (
          <div className="flex items-center">
            <div className="h-2 w-2 bg-green-400 rounded-full mr-2"></div>
            {formatAddress(account)}
          </div>
        ) : (
          "Connect Wallet"
        )}
      </button>
    </div>
  );
};

export default ConnectButton;
