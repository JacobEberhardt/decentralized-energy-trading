const Utility = artifacts.require("Utility");
const BaseOwnedSet = artifacts.require("BaseOwnedSet");
const UtilityBenchmark = artifacts.require("UtilityBenchmark");

const web3Helper = require("../helpers/web3");
const authorityHelper = require("../helpers/authority");

const {
  UTILITY_ADDRESS_IN_AUTHORITY,
  AUTHORITY_ADDRESS,
  OTHER_AUTHORITY_ADDRESS,
  OWNED_SET_ADDRESS,
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
      const utilityInstanceInAuthority = await Utility.at(UTILITY_ADDRESS_IN_AUTHORITY);
      const web3 = web3Helper.initWeb3("authority");
      const { address, password } = authorityHelper.getAddressAndPassword();
      await web3.eth.personal.unlockAccount(address, password, null);
      await utilityInstanceInAuthority.addHousehold(AUTHORITY_ADDRESS, {
        from: AUTHORITY_ADDRESS,
      });
      await web3.eth.personal.unlockAccount(address, password, null);
      await utilityInstanceInAuthority.addHousehold(OTHER_AUTHORITY_ADDRESS, {
        from: AUTHORITY_ADDRESS,
      });
      break;
    }
    case "authority_docker": {
      const otherAuthorityAddress = process.env.AUTHORITY_ADDRESS;
      const web3 = web3Helper.initWeb3("authority_docker");
      const { address, password } = authorityHelper.getAddressAndPassword();
      const ownedSetInstanceInAuthority = await BaseOwnedSet.at(OWNED_SET_ADDRESS);
      await web3.eth.personal.unlockAccount(address, password, null);
      await ownedSetInstanceInAuthority.addValidator(otherAuthorityAddress, {
        from: AUTHORITY_ADDRESS,
      });

      const utilityInstanceInAuthority = await Utility.at(UTILITY_ADDRESS_IN_AUTHORITY);
      await web3.eth.personal.unlockAccount(address, password, null);
      await utilityInstanceInAuthority.addHousehold(otherAuthorityAddress, {
        from: AUTHORITY_ADDRESS,
      });
      break;
    }
    case "benchmark": {
      deployer.deploy(UtilityBenchmark, 1000, 50, 1000, -2700, {
        gas: 99999999,
      });
      break;
    }
    default: {
      deployer.deploy(Utility);
      break;
    }
  }
};
