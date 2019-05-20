const Migrations = artifacts.require("Migrations");

module.exports = (deployer, network) => {
  if (network !== "authority") {
    deployer.deploy(Migrations);
  }
};
