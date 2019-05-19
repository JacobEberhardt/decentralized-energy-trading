const Utility = artifacts.require("Utility");

const web3Helper = require("../helpers/web3");
const authorityHelper = require("../helpers/authority");

const {
  UTILITY_ADDRESS_IN_AUTHORITY,
  AUTHORITY_ADDRESS
} = require("../helpers/constants");

module.exports = async (deployer, network, [authority]) => {
  switch (network) {
    case "ganache": {
      await deployer.deploy(Utility);
      const utilityInstance = await Utility.deployed();
      await utilityInstance.addHousehold(authority);
      break;
    }
    case "authority": {
      const utilityInstanceInAuthority = await Utility.at(
        UTILITY_ADDRESS_IN_AUTHORITY
      );
      const web3 = web3Helper.initWeb3("authority");
      const { address, password } = authorityHelper.getAddressAndPassword();
      await web3.eth.personal.unlockAccount(address, password, null);
      await utilityInstanceInAuthority.addHousehold(AUTHORITY_ADDRESS, {
        from: AUTHORITY_ADDRESS
      });
      break;
    }
    default: {
      deployer.deploy(Utility);
      break;
    }
  }
};
