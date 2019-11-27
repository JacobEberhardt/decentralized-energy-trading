const shell = require("shelljs");
const web3Utils = require("web3-utils");
const chalk = require("chalk");
const fs = require("fs")

const {
  performance
} = require('perf_hooks');

let cW_t0 = 0;
let cW_t1 = 0;
let cW_time = 0;

let gP_t0 = 0;
let gP_t1 = 0;
let gP_time = 0;

/**
 * This handler manages the communication of the NED Server and the ZoKrates environment
 */
module.exports = {
  generateProof: (utilityBeforeNetting, utilityAfterNetting, hhWithEnergy, hhNoEnergy) => {
    console.log("UtilityBeforeNetting: ", utilityBeforeNetting);
    console.log("UtilityAfterNetting: ", utilityAfterNetting);

    //currently netting fails when producer has 0 for meterDelta
    const hhAddressesWithEnergyBefore = utilityBeforeNetting.getHouseholdAddressesWithEnergy()

    const hhAddressesNoEnergyBefore = utilityBeforeNetting.getHouseholdAddressesNoEnergy();

    const hhAddresses = [
      ...hhAddressesWithEnergyBefore,
      ...hhAddressesNoEnergyBefore
    ];
    console.log(hhAddresses.length)
    const deltasWithEnergyBefore = hhAddressesWithEnergyBefore.map(address => utilityBeforeNetting.households[address].meterDelta).join(" ");

    const deltasNoEnergyBefore = hhAddressesNoEnergyBefore.map(address => Math.abs(utilityBeforeNetting.households[address].meterDelta)).join(" ");
    
    const deltasWithEnergyAfter = hhAddressesWithEnergyBefore.map(address => utilityAfterNetting[address].meterDelta).join(" ");

    const deltasNoEnergyAfter = hhAddressesNoEnergyBefore.map(address => Math.abs(utilityAfterNetting[address].meterDelta)).join(" ");

    process.stdout.write("Computing witness...");
    console.log(`zokrates compute-witness -a ${deltasWithEnergyBefore} ${deltasNoEnergyBefore} ${deltasWithEnergyAfter} ${deltasNoEnergyAfter} > /dev/null`)
    
    cW_t0 = performance.now();
    
    const witnessShellStr = shell
      .exec(
        `zokrates compute-witness -a ${deltasWithEnergyBefore} ${deltasNoEnergyBefore} ${deltasWithEnergyAfter} ${deltasNoEnergyAfter} > /dev/null`
      )
      .grep("--", "^~out_*", "witness");

    if (witnessShellStr.code !== 0) {
      process.stdout.write(chalk.red("failed\n"));
      throw new Error("zokrates compute-witness failed");
    }

    cW_t1 = performance.now();
    process.stdout.write(chalk.green("done\n"));

    cW_time = cW_t1 - cW_t0;
    
    console.log("zoKrates Witness Computation Execution Time in ms: ", cW_time);


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

    gP_t0 = performance.now();

    const proofShellStr = shell.exec("zokrates generate-proof  > /dev/null");

    if (proofShellStr.code !== 0) {
      process.stdout.write(chalk.red("failed\n"));
      throw new Error("zokrates generate-proof failed");
    }

    gP_t1 = performance.now();

    process.stdout.write(chalk.green("done\n"));

    gP_time = gP_t1 - gP_t0;

    console.log("zoKrates Proof Generation Execution Time in ms: ", gP_time);

    fs.writeFile('../tmp/zokrates_exec_time.json', JSON.stringify([cW_time, gP_time]), 'utf8',(err) => {   
      if (err) throw err;
    });

    return hhAddresses.reduce((addressToHashMap, address, i) => {
      addressToHashMap[address] = hashOutHex[i];
      return addressToHashMap;
    }, {});
  }
};