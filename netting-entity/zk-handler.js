const shell = require("shelljs");
const chalk = require("chalk");
const fs = require("fs");
const { performance } = require("perf_hooks");

/*
Because ZoKrates writes multiple files to disk instead of returning all output to stdout,
only one ZoKrates can run at any time.
To work around this we use the actor pattern: computation requests are enqueued,
if ZoKrates is idle we start it right away,
and every time ZoKrates is done we check if there is more work to be started.
*/

const workQueue = [];
let isWorking = false;

function tryStartWorking() {
  // rely on NodeJS Global Interpreter Lock for synchronization
  if (isWorking) return;
  const workItem = workQueue.shift();
  if (!workItem) return; // nothing to do

  isWorking = true;
  const {
    resultHandler: { resolve, reject }
  } = workItem;
  _generateProof(workItem)
    .then(resolve, reject)
    .finally(() => {
      isWorking = false;
      tryStartWorking();
    });
}

/**
 * This handler manages the communication of the NED Server and the ZoKrates environment.
 *
 * @returns {Promise<{ hhAddresses: any[], proofData: any }>}
 */
async function generateProof(utilityBeforeNetting, utilityAfterNetting, billingPeriod, mode) {
  let resultHandler;
  const promise = new Promise((resolve, reject) => {
    resultHandler = { resolve, reject };
  });
  const workItem = {
    utilityBeforeNetting,
    utilityAfterNetting,
    billingPeriod,
    mode,
    resultHandler
  };
  workQueue.push(workItem);
  tryStartWorking();

  const result = await promise;
  return result;
}

/**
 * This handler manages the communication of the NED Server and the ZoKrates environment.
 *
 * @returns {Promise<{ hhAddresses: any[], proofData: any }>}
 */
async function _generateProof(argsObj) {
  const { utilityBeforeNetting, utilityAfterNetting, billingPeriod, mode } = argsObj;

  let cW_t0 = 0;
  let cW_t1 = 0;
  let cW_time = 0;

  let gP_t0 = 0;
  let gP_t1 = 0;
  let gP_time = 0;

  const hhAddressesProducersBeforeNet = utilityBeforeNetting.getHouseholdAddressesProducers();
  const hhAddressesConsumersBeforeNet = utilityBeforeNetting.getHouseholdAddressesConsumers();

  const hhAddresses = [
    ...hhAddressesProducersBeforeNet,
    ...hhAddressesConsumersBeforeNet
  ];
  const deltasProducersBeforeNet = hhAddressesProducersBeforeNet.map(address => utilityBeforeNetting.households[address].meterDelta).join(" ");
  const deltasConsumersBeforeNet = hhAddressesConsumersBeforeNet.map(address => Math.abs(utilityBeforeNetting.households[address].meterDelta)).join(" ");

  const deltasProducersAfterNet = hhAddressesProducersBeforeNet.map(address => utilityAfterNetting.households[address].meterDelta).join(" ");
  const deltasConsumersAfterNet = hhAddressesConsumersBeforeNet.map(address => Math.abs(utilityAfterNetting.households[address].meterDelta)).join(" ");

  process.stdout.write("Computing witness...");

  const command = `zokrates compute-witness -a ${deltasProducersBeforeNet} ${deltasConsumersBeforeNet} ${deltasProducersAfterNet} ${deltasConsumersAfterNet} > /dev/null`;
  console.log(command);
  cW_t0 = performance.now();
  await shellExecAsync(command);
  cW_t1 = performance.now();

  const grepShellStr = shell.grep("--", "^~out_*", "witness");
  if (grepShellStr.code !== 0) {
    process.stdout.write(chalk.red("failed\n"));
    throw new Error("zokrates compute-witness failed: no ~out_*");
  }

  process.stdout.write(chalk.green("done\n"));

  if (mode === "benchmark_mode") {
    cW_time = cW_t1 - cW_t0;
    console.log("zoKrates Witness Computation Execution Time in ms: ", cW_time);
  }

  process.stdout.write("Generating proof...");

  gP_t0 = performance.now();
  await shellExecAsync("zokrates generate-proof > /dev/null");
  gP_t1 = performance.now();

  process.stdout.write(chalk.green("done\n"));

  if (mode === "benchmark_mode") {
    gP_time = gP_t1 - gP_t0;
    console.log("zoKrates Proof Generation Execution Time in ms: ", gP_time);
    fs.appendFile("../tmp/res.csv", `${cW_time},${gP_time}`, "utf8", err => {
      if (err) throw err;
    });
  }

  let rawdata = fs.readFileSync("proof.json");
  let proofData = JSON.parse(rawdata);

  return { hhAddresses, proofData };
}

/**
 * Execute a shell command asynchronously.
 * Throws an error if the exit code is nonzero.
 * Otherwise, returns stdout as ShellString.
 * @param {string} command
 * @returns {Promise<shell.ShellString>}
 */
function shellExecAsync(command) {
  return new Promise((resolve, reject) => {
    shell.exec(command, (code, stdout, stderr) => {
      if (code !== 0) {
        reject(new Error(`Nonzero exit code ${code} for command ${command}: ${stderr}`));
      } else resolve();
    });
  });
}

module.exports = {
  generateProof
};
