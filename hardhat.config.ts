import { HardhatUserConfig } from "hardhat/config";
import { vars } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
require("@nomicfoundation/hardhat-chai-matchers")

const PRIVATE_KEY = vars.get("PRIVATE_KEY");
const INFURA_API_KEY = vars.get("INFURA_API_KEY");
const ETHERSCAN_API_KEY = vars.get("ETHERSCAN_API_KEY");

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
  gasReporter: {
    currency: "USD",
    enabled: process.env.REPORT_GAS ? true : false,
    excludeContracts: [],
  },
  networks: {
    mainnet: {
      url: "https://mainnet.infura.io/v3/" + INFURA_API_KEY,
      chainId: 1,
      gasPrice: 20000000000,
      accounts: [PRIVATE_KEY]
    },
    sepolia: {
      url: "https://sepolia.infura.io/v3/" + INFURA_API_KEY,
      chainId: 11155111,
      gasPrice: 2000000000,
      accounts: [PRIVATE_KEY]
    },
  },
  solidity: {
    compilers: [
      {
        version: "0.8.17",
      },
      {
        version: "0.8.20",
      },
    ],
  },
};

export default config;
