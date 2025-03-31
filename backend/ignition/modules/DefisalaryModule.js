const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
const { network } = require("hardhat");
const {
  networkConfig,
  developmentChains,
} = require("../../helper-hardhat-config");

module.exports = buildModule("DefisalaryModule", (m) => {
  const networkName = network.name;
  const chainId = network.config.chainId;

  let priceFeedAddress;

  if (developmentChains.includes(networkName)) {
    console.log("Development network detected! Deploying mocks...");

    const mockPriceFeed = m.contract("MockV3Aggregator", [8, 200000000000]);
    priceFeedAddress = mockPriceFeed;

    console.log("Mocks deployed!");
    console.log(
      "___________________________________________________________________________________"
    );
  } else {
    priceFeedAddress = networkConfig[chainId]?.ethUsdPriceFeed;

    if (!priceFeedAddress) {
      throw new Error(`No ETH/USD price feed found for network ${networkName}`);
    }
  }

  const defisalary = m.contract("Defisalary", [priceFeedAddress]);

  return { defisalary };
});
