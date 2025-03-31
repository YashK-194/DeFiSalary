// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";
import "@chainlink/contracts/src/v0.8/automation/AutomationCompatible.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "./BokkyPooBahsDateTimeLibrary.sol";

contract Defisalary is Ownable(msg.sender), AutomationCompatibleInterface {
    using BokkyPooBahsDateTimeLibrary for uint256;

    struct Employee {
        uint256 id;
        string name;
        address payable walletAddress;
        uint256 salaryUSD;
        uint256 dateOfJoining;
        uint256 salaryPaymentDay;
        bool isActive;
    }

    struct PaymentRecord {
        uint256 id;
        uint256 timestamp;
        uint256 amountUSD;
        uint256 amountETH;
    }

    AggregatorV3Interface internal priceFeed;

    mapping(address => Employee) private employees;
    mapping(uint256 => address) private employeeIdToAddress;
    mapping(address => PaymentRecord[]) private paymentHistory;

    address[] private employeeAddresses;

    uint256 private nextEmployeeId = 1;
    uint256 private totalActiveEmployees = 0;
    uint256 private totalSalaryPaidUSD;

    event EmployeeAdded(
        uint256 indexed employeeId,
        address indexed employeeAddress,
        string name,
        uint256 salaryUSD
    );
    event EmployeeRemoved(
        uint256 indexed employeeId,
        address indexed employeeAddress
    );
    event EmployeeUpdated(
        uint256 indexed employeeId,
        address indexed employeeAddress
    );
    event SalaryPaid(
        address indexed employee,
        uint256 amountUSD,
        uint256 amountETH
    );

    error SalaryPaymentFailed(
        address employeeAddress,
        uint256 ethAmount,
        string reason
    );

    constructor(address _priceFeedAddress) {
        priceFeed = AggregatorV3Interface(_priceFeedAddress);
    }

    // Employee management functions
    function addEmployee(
        address _walletAddress,
        string memory _name,
        uint256 _salaryUSD,
        uint256 _salaryPaymentDay
    ) external onlyOwner returns (uint256) {
        require(
            _salaryPaymentDay > 0 && _salaryPaymentDay <= 29,
            "Invalid payment day"
        );
        require(
            employees[_walletAddress].walletAddress == address(0),
            "Employee already exists"
        );
        require(
            !employees[_walletAddress].isActive,
            "Employee already exists and is active"
        );

        uint256 newEmployeeId = nextEmployeeId++;
        employees[_walletAddress] = Employee({
            id: newEmployeeId,
            name: _name,
            walletAddress: payable(_walletAddress),
            salaryUSD: _salaryUSD,
            dateOfJoining: block.timestamp,
            salaryPaymentDay: _salaryPaymentDay,
            isActive: true
        });
        employeeIdToAddress[newEmployeeId] = _walletAddress;
        employeeAddresses.push(_walletAddress);
        totalActiveEmployees++;

        emit EmployeeAdded(newEmployeeId, _walletAddress, _name, _salaryUSD);
        return newEmployeeId;
    }

    function updateEmployeeDetails(
        address _employeeAddress,
        string memory _name,
        uint256 _salaryUSD,
        uint256 _salaryPaymentDay
    ) external onlyOwner {
        Employee storage employee = employees[_employeeAddress];
        require(employee.isActive, "Employee not active");

        require(
            _salaryPaymentDay > 0 && _salaryPaymentDay <= 29,
            "Invalid payment day"
        );

        employee.name = _name;
        employee.salaryUSD = _salaryUSD;
        employee.salaryPaymentDay = _salaryPaymentDay;

        emit EmployeeUpdated(employee.id, _employeeAddress);
    }

    function removeEmployee(address _employeeAddress) external onlyOwner {
        require(employees[_employeeAddress].isActive, "Employee not active");
        totalActiveEmployees--;
        employees[_employeeAddress].isActive = false;

        for (uint i = 0; i < employeeAddresses.length; i++) {
            if (employeeAddresses[i] == _employeeAddress) {
                // Move the last element to the position of the one being removed
                employeeAddresses[i] = employeeAddresses[
                    employeeAddresses.length - 1
                ];

                // Remove the last element (which is now duplicated)
                employeeAddresses.pop();
                break; // Exit loop after removal
            }
        }

        emit EmployeeRemoved(employees[_employeeAddress].id, _employeeAddress);
    }

    // USD to ETH conversion functions
    function getLatestETHPrice() public view returns (uint256) {
        (, int price, , , ) = priceFeed.latestRoundData();
        require(price > 0, "Invalid price data");
        return uint256(price) * 10 ** 10; // Adjust precision to 18 decimal places.
    }

    function calculateETHAmount(
        uint256 _usdAmount
    ) public view returns (uint256) {
        uint256 adjustedUsd = _usdAmount * (10 ** 18);
        uint256 ethPrice = getLatestETHPrice();

        return (adjustedUsd * 10 ** 18) / ethPrice;
    }

    // Utility Functions
    function getCurrentDate() internal view returns (uint256 day) {
        day = BokkyPooBahsDateTimeLibrary.getDay(block.timestamp);
    }

    function paySalary(address _employeeAddress) internal {
        Employee storage employee = employees[_employeeAddress];
        require(employee.isActive, "Employee not active");
        require(
            getCurrentDate() == employee.salaryPaymentDay,
            "Today is not employee's payment day"
        );

        uint256 ethAmount = calculateETHAmount(employee.salaryUSD);

        if (address(this).balance < ethAmount) {
            revert SalaryPaymentFailed(
                _employeeAddress,
                ethAmount,
                "Insufficient contract balance"
            );
        }

        (bool success, ) = employee.walletAddress.call{value: ethAmount}("");
        require(success, "ETH payment failed");
        paymentHistory[_employeeAddress].push(
            PaymentRecord({
                id: employee.id,
                timestamp: block.timestamp,
                amountUSD: employee.salaryUSD,
                amountETH: ethAmount
            })
        );
        totalSalaryPaidUSD += employee.salaryUSD;
        emit SalaryPaid(_employeeAddress, employee.salaryUSD, ethAmount);
    }

    // Chainlink Automation functions
    function checkUpkeep(
        bytes memory
    )
        public
        view
        override
        returns (bool upkeepNeeded, bytes memory performData)
    {
        for (uint i = 0; i < employeeAddresses.length; i++) {
            address employeeAddr = employeeAddresses[i];
            Employee memory employee = employees[employeeAddr];
            if (
                employee.isActive &&
                getCurrentDate() == employee.salaryPaymentDay
            ) {
                upkeepNeeded = true;
                performData = abi.encodePacked(employeeAddr);
                return (upkeepNeeded, performData);
            }
        }
        return (false, "");
    }

    function performUpkeep(bytes calldata performData) external override {
        (bool upkeepNeeded, ) = checkUpkeep("");
        require(upkeepNeeded, "Upkeep not needed");
        address employeeToPay = address(bytes20(performData));
        paySalary(employeeToPay);
    }

    // getter functions
    function getAllActiveEmployees() external view returns (Employee[] memory) {
        uint256 activeCount = 0;

        // First, count active employees to define array size
        for (uint256 i = 0; i < employeeAddresses.length; i++) {
            if (employees[employeeAddresses[i]].isActive) {
                activeCount++;
            }
        }

        // Create an array with the correct size
        Employee[] memory activeEmployees = new Employee[](activeCount);
        uint256 index = 0;

        // Populate the array with active employees
        for (uint256 i = 0; i < employeeAddresses.length; i++) {
            if (employees[employeeAddresses[i]].isActive) {
                activeEmployees[index] = employees[employeeAddresses[i]];
                index++;
            }
        }

        return activeEmployees;
    }

    function getAllInactiveEmployees()
        external
        view
        returns (Employee[] memory)
    {
        uint256 inactiveCount = 0;

        // Count inactive employees to define array size
        for (uint256 i = 0; i < employeeAddresses.length; i++) {
            if (!employees[employeeAddresses[i]].isActive) {
                inactiveCount++;
            }
        }

        // Create an array with the correct size
        Employee[] memory inactiveEmployees = new Employee[](inactiveCount);
        uint256 index = 0;

        // Populate the array with inactive employees
        for (uint256 i = 0; i < employeeAddresses.length; i++) {
            if (!employees[employeeAddresses[i]].isActive) {
                inactiveEmployees[index] = employees[employeeAddresses[i]];
                index++;
            }
        }

        return inactiveEmployees;
    }

    function getAllEmployeeAddresses()
        external
        view
        returns (address[] memory)
    {
        return employeeAddresses;
    }

    function getTotalActiveEmployees() external view returns (uint256) {
        return totalActiveEmployees;
    }

    function getTotalSalaryPaidUSD() external view returns (uint256) {
        return totalSalaryPaidUSD;
    }

    function getEmployeeCount() external view returns (uint256) {
        return employeeAddresses.length;
    }

    function getPaymentHistory(
        address _employeeAddress
    ) external view returns (PaymentRecord[] memory) {
        return paymentHistory[_employeeAddress];
    }

    function getEmployeeDetails(
        address _employeeAddress
    ) external view returns (Employee memory) {
        return employees[_employeeAddress];
    }

    function getEmployeeAddress(
        uint256 _employeeId
    ) external view returns (address) {
        return employeeIdToAddress[_employeeId];
    }

    receive() external payable {}
}
