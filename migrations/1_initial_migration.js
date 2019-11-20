const Migrations = artifacts.require("Migrations");

const web3Helper = require("../helpers/web3");
const { address, password } = require("../household-server-config");

module.exports = async (deployer, network) => {
  if (network !== "authority" && network !== "authority_docker") {
    if (network === "benchmark") {
      const web3 = web3Helper.initWeb3("benchmark");
      await web3.eth.personal.unlockAccount(address, password, null);
      await deployer.deploy(Migrations);
      await web3.eth.personal.unlockAccount(address, password, null);
    } else {
      await deployer.deploy(Migrations);
    }
  }
};
