require("dotenv").config()
require("@nomiclabs/hardhat-etherscan")
require("@nomiclabs/hardhat-solhint")
require("hardhat-deploy")
require("solidity-coverage")
require("@nomiclabs/hardhat-waffle")
require("hardhat-gas-reporter")


const RINKEBY_RPC_URL = process.env.RINKEBY_URL_RPC
const PRIVATE_KEY = process.env.PRIVATE_KEY
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY


module.exports = {
  //solidity: "0.8.8",
  solidity: {
    compilers: [{ version: "0.8.8" }, { version: "0.6.6" }]
  },
  namedAccounts: {
    deployer: {
      default: 0, // here this will by default take the first account as deployer
    },
  },
  networks: {
    rinkeby: {
      url: RINKEBY_RPC_URL,
      accounts: [PRIVATE_KEY],
      chainId: 4,
      blockConfirmations: 6,
    },
    localhost: {
      url: "http://127.0.0.1:8545/",
      //accounts already imported
      chainId: 31337,
    },
  },
  gasReporter: {
    enabled: false,
    outputFile: "gas-usage.txt",
    noColors: true,
    currency: "USD",
    coinmarketcap: COINMARKETCAP_API_KEY,
    token: "ETH"
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,

  },
};

