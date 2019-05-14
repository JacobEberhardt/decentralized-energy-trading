const Utility = artifacts.require("Utility");

module.exports = async (deployer, network, [authority]) => {
  switch (network) {
    case "ganache": {
      await deployer.deploy(Utility);
      const utilityInstance = await Utility.deployed();
      await utilityInstance.addHousehold(authority);
      break;
    }
    default: {
      deployer.deploy(Utility);
      break;
    }
  }
};
