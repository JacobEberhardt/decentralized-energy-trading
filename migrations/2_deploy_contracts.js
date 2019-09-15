const chalk = require("chalk");
const request = require("request-promise");

const Utility = artifacts.require("dUtility");
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
  TESTS_FAKE_ADDRESS,
  VERIFIER_ADDRESS
} = require("../helpers/constants");
const options = { resolveWithFullResponse: true };

async function addValidator(validator, ownedSetInstance, web3) {
  process.stdout.write(`  Adding ${validator} to OwnedSet contract ... `);
  await web3.eth.personal.unlockAccount(address, password, null);
  await ownedSetInstance.addValidator(validator, {
    from: AUTHORITY_ADDRESS
  });
  process.stdout.write(chalk.green("done\n"));
}

async function finalizeChange(ownedSetInstance, web3) {
  process.stdout.write(`  Finalizing changes to OwnedSet contract ... `);
  await web3.eth.personal.unlockAccount(address, password, null);
  await ownedSetInstance.finalizeChange();
  process.stdout.write(chalk.green("done\n"));
}

async function callRPC(methodSignature, port, params = []) {
  const { statusCode, body } = await request(`http://localhost:${port}`, {
    method: "POST",
    json: {
      jsonrpc: "2.0",
      method: methodSignature,
      params: params,
      id: 0,
    },
    ...options,
  });

  return { statusCode, body };
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

      process.stdout.write("  Set verifier contract address ... ");
      await web3.eth.personal.unlockAccount(address, password, null);
      await utilityInstanceInAuthority.setVerifier(VERIFIER_ADDRESS, {
        from: AUTHORITY_ADDRESS
      });
      process.stdout.write(chalk.green("done\n"));

      process.stdout.write("  Adding admin node to Utility contract ... ");
      await web3.eth.personal.unlockAccount(address, password, null);
      await utilityInstanceInAuthority.addHousehold(AUTHORITY_ADDRESS, {
        from: AUTHORITY_ADDRESS
      });
      process.stdout.write(chalk.green("done\n"));

      process.stdout.write("  Transfer ownership of Utility contract ... ");
      await web3.eth.personal.unlockAccount(address, password, null);
      await utilityInstanceInAuthority.transferOwnership(OWNED_SET_ADDRESS, {
        from: AUTHORITY_ADDRESS
      });
      process.stdout.write(chalk.green("done\n"));

      process.stdout.write("  Adding authority addresses ...\n");
      await asyncUtils.asyncForEach(OTHER_AUTHORITY_ADDRESSES, async a => {
        await addValidator(a, ownedSetInstanceInAuthority, web3);
        await web3.eth.personal.unlockAccount(address, password, null);
        process.stdout.write(`Sending ether from ${AUTHORITY_ADDRESS} to ${a} ...`);
        const params = [
          {
            from: AUTHORITY_ADDRESS,
            to: "0x" + a,
            value: "0xde0b6b3a7640000",
          },
          "node0"
        ];
        const transactionAddress = (await callRPC("personal_sendTransaction", 8545, params)).body;
        process.stdout.write(chalk.green("done\n"));
      });

      await addValidator(TESTS_FAKE_ADDRESS, ownedSetInstanceInAuthority, web3);
      await finalizeChange(ownedSetInstanceInAuthority, web3);

      process.stdout.write("  Removing 'fake' authority addresses ...");
      await web3.eth.personal.unlockAccount(address, password, null);
      await ownedSetInstanceInAuthority.removeValidator(TESTS_FAKE_ADDRESS, {
        from: AUTHORITY_ADDRESS
      });
      process.stdout.write(chalk.green("done\n"));
      await finalizeChange(ownedSetInstanceInAuthority, web3);
      break;
    }
    case "authority_docker": {
      const otherAuthorityAddress = process.env.AUTHORITY_ADDRESS;
      const web3 = web3Helper.initWeb3("authority_docker");
      const ownedSetInstanceInAuthority = await OwnedSet.at(OWNED_SET_ADDRESS);
      await addValidator(otherAuthorityAddress, ownedSetInstanceInAuthority, web3);
      await finalizeChange(ownedSetInstanceInAuthority, web3);
      break;
    }
    case "benchmark": {
      deployer.deploy(UtilityBenchmark, 1000, 50, 1000, -2700, {
        gas: 99999999
      });
      break;
    }
    default: {
      deployer.deploy(Utility);
      break;
    }
  }
};
