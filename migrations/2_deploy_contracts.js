const chalk = require("chalk");

const Utility = artifacts.require("Utility");
const OwnedSet = artifacts.require("OwnedSet");
const UtilityBenchmark = artifacts.require("UtilityBenchmark");

const web3Helper = require("../helpers/web3");
const asyncUtils = require("../helpers/async-utils");
const { address, password } = require("../household-server-config");
const {
  UTILITY_ADDRESS,
  AUTHORITY_ADDRESS,
  OTHER_AUTHORITY_ADDRESSES,
  OWNED_SET_ADDRESS,
} = require("../helpers/constants");

async function addValidator(validator, ownedSetInstance) {
  process.stdout.write(`  Adding ${validator} to OwnedSet contract ... `);
  await web3.eth.personal.unlockAccount(address, password, null);
  await ownedSetInstance.addValidator(validator, {
    from: AUTHORITY_ADDRESS,
  });
  process.stdout.write(chalk.green("done\n"));
}

async function finalizeChange(ownedSetInstance) {
  process.stdout.write(`  Finalizing changes to OwnedSet contract ... `);
  await web3.eth.personal.unlockAccount(address, password, null);
  await ownedSetInstance.finalizeChange();
  process.stdout.write(chalk.green("done\n"));
}

module.exports = async (deployer, network, [authority]) => {
  switch (network) {
    case "ganache": {
      await deployer.deploy(Utility);
      const utilityInstance = await Utility.deployed();
      await utilityInstance.addHousehold(authority);
      break;
    }
    case "authority": {
      const utilityInstanceInAuthority = await Utility.at(UTILITY_ADDRESS);
      const ownedSetInstanceInAuthority = await OwnedSet.at(OWNED_SET_ADDRESS);
      const web3 = web3Helper.initWeb3("authority");

      process.stdout.write("  Adding admin node to Utility contract ... ");
      await web3.eth.personal.unlockAccount(address, password, null);
      await utilityInstanceInAuthority.addHousehold(AUTHORITY_ADDRESS, {
        from: AUTHORITY_ADDRESS,
      });
      process.stdout.write(chalk.green("done\n"));

      process.stdout.write("  Transfer ownership of Utility contract ... ");
      await web3.eth.personal.unlockAccount(address, password, null);
      await utilityInstanceInAuthority.transferOwnership(OWNED_SET_ADDRESS, {
        from: AUTHORITY_ADDRESS,
      });
      process.stdout.write(chalk.green("done\n"));

      process.stdout.write("  Adding authority addresses ...\n");
      await asyncUtils.asyncForEach(OTHER_AUTHORITY_ADDRESSES, async a => {
        await addValidator(a, ownedSetInstanceInAuthority);
      });

      const fakeAddress = "0xFbc22a13295Dea4EfBb061ff162CD19B362d1F1D";

      await addValidator(fakeAddress, ownedSetInstanceInAuthority);
      await finalizeChange(ownedSetInstanceInAuthority);

      process.stdout.write("  Removing 'fake' authority addresses ...");
      await web3.eth.personal.unlockAccount(address, password, null);
      await ownedSetInstanceInAuthority.removeValidator(fakeAddress, {
        from: AUTHORITY_ADDRESS,
      });
      process.stdout.write(chalk.green("done\n"));
      await finalizeChange(ownedSetInstanceInAuthority);

      break;
    }
    case "authority_docker": {
      const otherAuthorityAddress = process.env.AUTHORITY_ADDRESS;
      const web3 = web3Helper.initWeb3("authority_docker");
      const ownedSetInstanceInAuthority = await OwnedSet.at(OWNED_SET_ADDRESS);
      await web3.eth.personal.unlockAccount(address, password, null);
      await ownedSetInstanceInAuthority.addValidator(otherAuthorityAddress, {
        from: AUTHORITY_ADDRESS,
      });

      const utilityInstanceInAuthority = await Utility.at(UTILITY_ADDRESS);
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
