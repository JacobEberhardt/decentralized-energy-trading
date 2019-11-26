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
    console.log("UtilityBeforeNetting: ", utilityBeforeNetting);
    console.log("UtilityAfterNetting: ", utilityAfterNetting);

    const hhAddressesWithEnergyBefore = utilityBeforeNetting.getHouseholdAddressesWithEnergy()

    const hhAddressesNoEnergyBefore = utilityBeforeNetting.getHouseholdAddressesNoEnergy();

    const hhAddresses = [
      ...hhAddressesWithEnergyBefore,
      ...hhAddressesNoEnergyBefore
    ];

    const deltasWithEnergyBefore = hhAddressesWithEnergyBefore.map(address => utilityBeforeNetting.households[address].meterDelta).join(" ");

    const deltasNoEnergyBefore = hhAddressesNoEnergyBefore.map(address => Math.abs(utilityBeforeNetting.households[address].meterDelta)).join(" ");
    
    const deltasWithEnergyAfter = hhAddressesWithEnergyBefore.map(address => utilityAfterNetting[address].meterDelta).join(" ");

    console.log(hhAddressesNoEnergyBefore)
    const deltasNoEnergyAfter = hhAddressesNoEnergyBefore.map(address => Math.abs(utilityAfterNetting[address].meterDelta)).join(" ");
    console.log("Biactchhhh")

    console.log("Addresses With: ", hhAddressesWithEnergyBefore)
    console.log("Addresses Without: ", hhAddressesNoEnergyBefore)

    process.stdout.write("Computing witness...");
    console.log(`zokrates compute-witness -a ${deltasWithEnergyBefore} ${deltasNoEnergyBefore} ${deltasWithEnergyAfter} ${deltasNoEnergyAfter} > /dev/null`)
    const witnessShellStr = shell
      .exec(
        `zokrates compute-witness -a ${deltasWithEnergyBefore} ${deltasNoEnergyBefore} ${deltasWithEnergyAfter} ${deltasNoEnergyAfter} > /dev/null`
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