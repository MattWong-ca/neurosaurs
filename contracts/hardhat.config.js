require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: "0.8.24",
  networks: {
    sepolia: {
      url: `https://rpc.sepolia.org`,
      accounts: [process.env.PRIVATE_KEY],
      gasPrice: 1000000000,
    }
  }
};