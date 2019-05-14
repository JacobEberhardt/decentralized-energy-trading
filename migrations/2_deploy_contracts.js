const FifsUtility = artifacts.require("FifsUtility");
const UtilityBase = artifacts.require("UtilityBase");

module.exports = function(deployer) {
  deployer.deploy(FifsUtility);
  deployer.deploy(UtilityBase);
};
