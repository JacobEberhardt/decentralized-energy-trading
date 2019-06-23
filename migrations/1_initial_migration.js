const Migrations = artifacts.require("Migrations");

module.exports = (deployer, network) => {
  if (network !== "authority" && network !== "authority_docker") {
    deployer.deploy(Migrations);
  }
};
