const shell = require("shelljs");
const chalk = require("chalk");
const fs = require("fs");
const { performance } = require("perf_hooks");

/**
 * This handler manages the communication of the NED Server and the ZoKrates environment
 */
module.exports = {
  generateProof: (utilityBeforeNetting, utilityAfterNetting, hhWithEnergy, hhNoEnergy, mode) => {
    let cW_t0 = 0;
    let cW_t1 = 0;
    let cW_time = 0;

    let gP_t0 = 0;
    let gP_t1 = 0;
    let gP_time = 0;

    const hhAddressesWithEnergyBefore = utilityBeforeNetting.getHouseholdAddressesWithEnergy();
    const hhAddressesNoEnergyBefore = utilityBeforeNetting.getHouseholdAddressesNoEnergy();

    const hhAddresses = [
      ...hhAddressesWithEnergyBefore,
      ...hhAddressesNoEnergyBefore
    ];
    const deltasWithEnergyBefore = hhAddressesWithEnergyBefore.map(address => utilityBeforeNetting.households[address].meterDelta).join(" ");
    const deltasNoEnergyBefore = hhAddressesNoEnergyBefore.map(address => Math.abs(utilityBeforeNetting.households[address].meterDelta)).join(" ");

    const deltasWithEnergyAfter = hhAddressesWithEnergyBefore.map(address => utilityAfterNetting.households[address].meterDelta).join(" ");
    const deltasNoEnergyAfter = hhAddressesNoEnergyBefore.map(address => Math.abs(utilityAfterNetting.households[address].meterDelta)).join(" ");

    process.stdout.write("Computing witness...");
    console.log(`zokrates compute-witness -a ${deltasWithEnergyBefore} ${deltasNoEnergyBefore} ${deltasWithEnergyAfter} ${deltasNoEnergyAfter} > /dev/null`);

    cW_t0 = performance.now();

    const witnessShellStr = shell
      .exec(
        `zokrates compute-witness -a ${deltasWithEnergyBefore} ${deltasNoEnergyBefore} ${deltasWithEnergyAfter} ${deltasNoEnergyAfter} > /dev/null`
      )
      .grep("--", "^~out_*", "witness");

    cW_t1 = performance.now();

    if (witnessShellStr.code !== 0) {
      process.stdout.write(chalk.red("failed\n"));
      throw new Error("zokrates compute-witness failed");
    }

    process.stdout.write(chalk.green("done\n"));

    if (mode === "benchmark_mode") {
      cW_time = cW_t1 - cW_t0;
      console.log("zoKrates Witness Computation Execution Time in ms: ", cW_time);
    }

    process.stdout.write("Generating proof...");

    gP_t0 = performance.now();
    const proofShellStr = shell.exec("zokrates generate-proof  > /dev/null");
    gP_t1 = performance.now();

    if (proofShellStr.code !== 0) {
      process.stdout.write(chalk.red("failed\n"));
      throw new Error("zokrates generate-proof failed");
    }

    process.stdout.write(chalk.green("done\n"));

    if (mode === "benchmark_mode") {
      gP_time = gP_t1 - gP_t0;
      console.log("zoKrates Proof Generation Execution Time in ms: ", gP_time);
      fs.appendFile("../tmp/res.csv", `${cW_time},${gP_time}`, "utf8", err => {
        if (err) throw err;
      });
    }

    return hhAddresses;
  }
};
