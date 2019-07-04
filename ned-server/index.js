const express = require("express");
const cors = require("cors");
const commander = require("commander");
const web3Utils = require("web3-utils");

const Utility = require("../utility-js/Utility");
const hhHandler = require("./household-handler");
const zkHandler = require("./zk-handler");
const web3Helper = require("../helpers/web3");
const contractHelper = require("../helpers/contract");
// const dUtilityHandler = require("./utility-contract-handler");

const serverConfig = require("../ned-server-config");

// Specify cli options
commander
  .option("-h, --host <type>", "ip of ned server")
  .option("-p, --port <type>", "port of ned server")
  .option("-i, --interval <type>", "interval of the netting")
  .option(
    "-n, --network <type>",
    "network name specified in truffle-config.js"
  );
commander.parse(process.argv);

const config = {
  nettingInterval: commander.interval || serverConfig.nettingInterval,
  host: commander.host || serverConfig.host,
  port: commander.port || serverConfig.port,
  network: commander.network || serverConfig.network
};

let web3;
let utility;
let ownedSetContract;
// let utilityContract;

async function init() {
  web3 = web3Helper.initWeb3(config.network);

  // Off-chain utility instance
  utility = new Utility();
  // utilityContract = new web3.eth.Contract(
  //   contractHelper.getAbi("utility"),
  //   contractHelper.getDeployedAddress("utility", await web3.eth.net.getId())
  // );
  ownedSetContract = new web3.eth.Contract(
    contractHelper.getAbi("ownedSet"),
    contractHelper.getDeployedAddress("ownedSet", await web3.eth.net.getId())
  );

  function runZokrates() {
    const utilityCopy = { ...utility };
    Object.setPrototypeOf(utilityCopy, Utility.prototype);
    const utilityBeforeNetting = { ...utilityCopy };
    Object.setPrototypeOf(utilityBeforeNetting, Utility.prototype);
    utilityCopy.settle();
    const hashes = zkHandler.generateProof(utilityBeforeNetting, utilityCopy);
    console.log(hashes);
    // TODO Call contract method of dUtility.sol contract
    // const txReceipt = await dUtilityHandler.sendProof(utilityContract, hash);
    // console.log(txReceipt);
    // TODO Set new utility state on successful verification. E.g. event is emitted.
    utility = utilityCopy;
  }

  setInterval(() => {
    runZokrates();
  }, config.nettingInterval);
}

init();

const app = express();

app.use(express.json());
app.use(cors());

/**
 * PUT /energy/:householdAddress
 */
app.put("/energy/:householdAddress", async (req, res) => {
  try {
    const householdAddress = web3Utils.toChecksumAddress(
      req.params.householdAddress
    );
    const { signature, hash, timestamp, meterReading } = req.body;

    if (typeof meterReading !== "number") {
      throw new Error("Invalid payload");
    }

    if (
      !(await hhHandler.isValidatorAddress(ownedSetContract, householdAddress))
    ) {
      throw new Error("Given address is not a validator");
    }

    if (
      !(await web3Helper.verifySignature(
        web3,
        hash,
        signature,
        householdAddress
      ))
    ) {
      throw new Error("Invalid signature");
    }

    utility.addHousehold(householdAddress);
    utility.updateMeterReading(householdAddress, meterReading, timestamp);

    console.log(utility.households);

    res.status(200);
    res.send();
  } catch (err) {
    res.status(400);
    res.send(err);
  }
});
/**
 * GET endpoint returning the current energy balance of renewableEnergy from Utility.js
 */
app.get("/network", function(req, res, next) {
  try {
    res.status(200);
    res.end({
      renewableEnergy: utility.getRenewableEnergy(),
      nonRenewableEnergy: utility.getNonRenewableEnergy()
    });
  } catch (err) {
    res.status(400);
    res.send(err);
  }
});

/**
 * GET endpoint returning the current energy balance of the requested Household form Utility.js
 */
app.get("/household/:householdAddress", function(req, res, next) {
  try {
    const householdAddress = web3Utils.toChecksumAddress(
      req.params.householdAddress
    );
    let energyBalance = utility.getHousehold(householdAddress);
    res.status(200);
    res.end(energyBalance);
  } catch (err) {
    res.status(400);
    res.send(err);
  }
});

/**
 * GET endpoint returning the deeds of a specific Household and a given day from Utility.js
 * Access this like: http://127.0.0.1:3005/deeds/123456789?fromDate=1122465557 (= Date.now())
 */
app.get("/deeds/:householdAddress", function(req, res, next) {
  try {
    const fromDate = req.query.fromDate;
    const householdAddress = web3Utils.toChecksumAddress(
      req.params.householdAddress
    );
    console.log(householdAddress, fromDate);
    let deeds = utility.getDeeds(householdAddress, fromDate);
    res.status(200);
    res.end(deeds);
  } catch (err) {
    res.status(400);
    res.send(err);
  }
});

/**
 * GET request not supported
 */
app.get("/", function(req, res, next) {
  res.status(400);
  res.end(req.method + " is not supported.\n");
});

/**
 * POST request not supported
 */
app.post("/", function(req, res, next) {
  res.status(400);
  res.end(req.method + " is not supported.\n");
});

/**
 * DELETE request not supported
 */
app.delete("/", function(req, res, next) {
  res.status(400);
  res.end(req.method + " is not supported.\n");
});

/**
 * Let the server listen to incoming requests on the given IP:Port
 */
app.listen(config.port, () => {
  console.log(`NED Server running at http://${config.host}:${config.port}/`);
});
