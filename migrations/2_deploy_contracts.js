const Utility = artifacts.require("Utility");
const UtilityBase = artifacts.require("UtilityBase");

module.exports = function(deployer) {
  deployer.deploy(Utility);
  deployer.deploy(UtilityBase);
};
