const Utility = artifacts.require("Utility");

module.exports = async (deployer, network, [authority]) => {
  if (network === "ganache") {
    await deployer.deploy(Utility);
    const utilityInstance = await Utility.deployed();
    await utilityInstance.addHousehold(authority);
  } else {
    deployer.deploy(Utility);
  }
};
