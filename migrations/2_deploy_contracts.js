const FifsUtility = artifacts.require("FifsUtility");

module.exports = function(deployer) {
  deployer.deploy(FifsUtility);
};
