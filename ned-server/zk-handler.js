const shell = require("shelljs");
const web3Utils = require("web3-utils");
const chalk = require("chalk");

const addressHelper = require("../helpers/address-arr");
const zokratesHelper = require("../helpers/zokrates");
const conversionHelper = require("../helpers/conversion");

/**
 * This handler manages the communication of the NED Server and the ZoKrates environment
 */
module.exports = {
  generateProof: (utilityBeforeNetting, utilityAfterNetting, hhWithEnergy, hhNoEnergy) => {
    const hhAddressesWithEnergyBefore = addressHelper.enforceAddressArrLength(
      utilityBeforeNetting.getHouseholdAddressesWithEnergy(),
      hhWithEnergy
    );
    const hhAddressesNoEnergyBefore = addressHelper.enforceAddressArrLength(
      utilityBeforeNetting.getHouseholdAddressesNoEnergy(),
      hhNoEnergy
    );
    const hhAddresses = [
      ...hhAddressesWithEnergyBefore,
      ...hhAddressesNoEnergyBefore
    ];
    const balancesWithEnergyBefore = hhAddressesWithEnergyBefore
      .map(address =>
        conversionHelper.kWhToWs(
          utilityBeforeNetting.households[address].renewableEnergy
        )
      )
      .join(" ");
    const balancesNoEnergyBefore = hhAddressesNoEnergyBefore
      .map(address =>
        conversionHelper.kWhToWs(
          Math.abs(utilityBeforeNetting.households[address].renewableEnergy)
        )
      )
      .join(" ");
    const balancesWithEnergyAfter = hhAddressesWithEnergyBefore
      .map(address =>
        conversionHelper.kWhToWs(
          utilityAfterNetting.households[address].renewableEnergy
        )
      )
      .join(" ");
    const balancesNoEnergyAfter = hhAddressesNoEnergyBefore
      .map(address =>
        conversionHelper.kWhToWs(
          Math.abs(utilityAfterNetting.households[address].renewableEnergy)
        )
      )
      .join(" ");

    const packedParams = hhAddresses
      .map(address => {
        return web3Utils.hexToNumber(
          zokratesHelper.padPackParams256(
            conversionHelper.kWhToWs(
              // TODO: Handle negative meter readings
              Math.abs(utilityBeforeNetting.households[address].meterDelta)
            )
          )
        )
      })
      .join(" ");

    process.stdout.write("Computing witness...");
    const witnessShellStr = shell
      .exec(
        `zokrates compute-witness -a ${balancesWithEnergyBefore} ${balancesNoEnergyBefore} ${balancesWithEnergyAfter} ${balancesNoEnergyAfter} ${packedParams} > /dev/null`
      )
      .grep("--", "^~out_*", "witness");

    if (witnessShellStr.code !== 0) {
      process.stdout.write(chalk.red("failed\n"));
      throw new Error("zokrates compute-witness failed");
    }
    process.stdout.write(chalk.green("done\n"));

    const hashArr = witnessShellStr.stdout
      .split("\n")
      .filter(str => str)
      .reverse()
    const hashOutHex = hashArr.reduce((hashes, hashPart, i) => {
      if (i % 2 !== 0) {
        return hashes;
      }
      const hashOut0 = hashArr[i].substr(7);
      const hashOut1 = hashArr[i + 1].substr(7);
      const hashOut0Padded = web3Utils.padLeft(
        web3Utils.toBN(hashOut0).toString("hex"),
        32
      );
      const hashOut1Padded = web3Utils.padLeft(
        web3Utils.toBN(hashOut1).toString("hex"),
        32
      );
      const hashHex = `0x${hashOut0Padded}${hashOut1Padded}`;
      hashes.push(hashHex);
      return hashes;
    }, []);

    process.stdout.write("Generating proof...");
    const proofShellStr = shell.exec("zokrates generate-proof  > /dev/null");

    if (proofShellStr.code !== 0) {
      process.stdout.write(chalk.red("failed\n"));
      throw new Error("zokrates generate-proof failed");
    }
    process.stdout.write(chalk.green("done\n"));

    return hhAddresses.reduce((addressToHashMap, address, i) => {
      addressToHashMap[address] = hashOutHex[i];
      return addressToHashMap;
    }, {});
  }
};
