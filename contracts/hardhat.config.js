require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: "0.8.24",
  networks: {
    sepolia: {
      url: `https://rpc.sepolia.org`,
      accounts: [process.env.PRIVATE_KEY],
      gasPrice: 1000000000,
    },
    flow: {
      url: `https://testnet.evm.nodes.onflow.org`,
      accounts: [process.env.PRIVATE_KEY],
      gasPrice: 1000000000,
    },
    skale: {
      url: `https://testnet.skalenodes.com/v1/giant-half-dual-testnet`,
      accounts: [process.env.PRIVATE_KEY],
      gasPrice: 1000000000,
    },
    polygon: {
      url: `https://rpc-amoy.polygon.technology`,
      accounts: [process.env.PRIVATE_KEY],
      gasPrice: 25000000000,
    },
    morph: {
      url: `https://rpc-quicknode-holesky.morphl2.io`,
      accounts: [process.env.PRIVATE_KEY],
      gasPrice: 1000000000,
    }
  }
};