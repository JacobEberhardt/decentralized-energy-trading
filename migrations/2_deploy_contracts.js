const FifsUtility = artifacts.require("FifsUtility");
const Utility = artifacts.require("Utility");

module.exports = function(deployer) {
  deployer.deploy(FifsUtility);
  deployer.deploy(Utility);
};
