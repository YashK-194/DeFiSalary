# DeFiSalary - Backend

## Overview

This is the backend repository for the DeFiSalary project. It includes the Solidity smart contracts and Hardhat scripts for development, testing, deployment, verification and gas report.

## Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) (Latest LTS version)
- [MetaMask](https://metamask.io/) (For interacting with the deployed contracts)

## Installation

1. cd into the backend folder:

   ```sh
   cd defisalary/backend
   ```

2. Install dependencies:
   ```sh
   npm install
   ```

## Usage

### 1. Compile the Smart Contracts

```sh
npx hardhat compile
```

### 2. Run Unit Tests

```sh
npx hardhat test
```

### 3. Run Solidity Coverage

```sh
npx hardhat coverage
```

Current tests cover 85% of the solidity contract

### 4. Run Hardhat gas reporter

```sh
npx hardhat test
```

Checkout [gas-report.txt](backend/gas-report.txt)

### 5. Start a Local Hardhat Node

```sh
npx hardhat node
```

### 6. Deploy Smart Contracts (Using Hardhat Ignition)

```sh
npx hardhat ignition deploy ignition/modules/DefisalaryModule.js --network localhost
```

### 7. Deploy to a Testnet (e.g., Sepolia)

```sh
npx hardhat ignition deploy ignition/modules/DefisalaryModule.js --network sepolia
```

### 8. Verify Smart Contract on Etherscan

```sh
npx hardhat verify --network sepolia <contract_address>
```

Replace `<contract_address>` with the actual deployed contract address.

## License

This project is licensed under the MIT License.

## Contact

For any inquiries, reach out via GitHub, LinkedIn: [linkedin.com/in/yashk194](https://www.linkedin.com/in/yashk194/) or email at `yashkm194@gmail.com`.
