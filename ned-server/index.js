const express = require("express");
const cors = require("cors");
const commander = require("commander");
const web3Utils = require("web3-utils");
const shell = require("shelljs");
const fs = require("fs");
const Utility = require("../utility-js/Utility");
const hhHandler = require("./household-handler");
const zkHandler = require("./zk-handler");
const web3Helper = require("../helpers/web3");
const contractHelper = require("../helpers/contract");

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
  network: commander.network || serverConfig.network,
  address: serverConfig.address,
  password: serverConfig.password
};

let web3;
/** @type Utility */
let utility;
/** @type Utility */
let utilityAfterNetting;
let ownedSetContract;
let utilityContract;
let latestBlockNumber;

async function init() {
  web3 = web3Helper.initWeb3(config.network);
  latestBlockNumber = await web3.eth.getBlockNumber();
  // Off-chain utility instance
  utility = new Utility();
  utilityContract = new web3.eth.Contract(
    contractHelper.getAbi("dUtility"),
    contractHelper.getDeployedAddress("dUtility", await web3.eth.net.getId())
  );
  ownedSetContract = new web3.eth.Contract(
    contractHelper.getAbi("ownedSet"),
    contractHelper.getDeployedAddress("ownedSet", await web3.eth.net.getId())
  );
  shell.cd("zokrates-code");

  utilityContract.events.NettingSuccess(
    {
      fromBlock: latestBlockNumber
    },
    async (error, event) => {
      if (error) {
        console.error(error.msg);
        throw error;
      }
      console.log("Netting Successful!");
      latestBlockNumber = event.blockNumber;
      utility = utilityAfterNetting;
    }
  );

  async function runZokrates() {
    let utilityBeforeNetting = JSON.parse(JSON.stringify(utility)); // dirty hack for obtaining deep copy of utility
    Object.setPrototypeOf(utilityBeforeNetting, Utility.prototype);
    utilityAfterNetting = { ...utility };
    Object.setPrototypeOf(utilityAfterNetting, Utility.prototype);
    utilityAfterNetting.settle();
    console.log("Utility before Netting: ", utilityBeforeNetting)
    console.log("Utility after Netting: ", utilityAfterNetting)
    const hhWithEnergy = serverConfig.hhProduce;
    const hhNoEnergy = serverConfig.hhConsume;
    let hhAddresses = zkHandler.generateProof(
      utilityBeforeNetting,
      utilityAfterNetting,
      hhWithEnergy,
      hhNoEnergy,
      "real_mode"
    );

    let rawdata = fs.readFileSync("../zokrates-code/proof.json");
    let data = JSON.parse(rawdata);
    if (hhAddresses.length > 0) {
      await web3.eth.personal.unlockAccount(
        config.address,
        config.password,
        null
      );
      utilityContract.methods
        .checkNetting(
          hhAddresses,
          data.proof.a,
          data.proof.b,
          data.proof.c,
          data.inputs
        )
        .send({ from: config.address, gas: 60000000 }, (error, txHash) => {
          if (error) {
            console.error(error.message);
            throw error;
          }
          console.log(`Sleep for ${config.nettingInterval}ms ...`);
          setTimeout(() => {
            runZokrates();
          }, config.nettingInterval);
        });
    } else {
      console.log("No households to hash.");
      console.log(`Sleep for ${config.nettingInterval}ms ...`);
      setTimeout(() => {
        runZokrates();
      }, config.nettingInterval);
    }
  }

  setTimeout(() => {
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
    const { signature, hash, timestamp, meterDelta } = req.body;

    if (typeof meterDelta !== "number") {
      throw new Error("Invalid payload: meterDelta is not a number");
    }

    const validHouseholdAddress = await hhHandler.isValidatorAddress(
      ownedSetContract,
      householdAddress
    );
    if (!validHouseholdAddress) {
      throw new Error("Given address is not a validator");
    }

    const validSignature = await web3Helper.verifySignature(
      web3,
      hash,
      signature,
      householdAddress
    );
    if (!validSignature) {
      throw new Error("Invalid signature");
    }

    if (utility.addHousehold(householdAddress)) {
      console.log(`New household ${householdAddress} added`);
    }
    console.log(
      `Incoming meter delta ${meterDelta} at ${timestamp} for ${householdAddress}`
    );
    utility.updateMeterDelta(householdAddress, meterDelta, timestamp);

    res.status(200);
    res.send();
  } catch (err) {
    console.error("PUT /energy/:householdAddress", err.message);
    res.status(400);
    res.send(err);
  }
});

/**
 * GET endpoint returning the current energy balance of renewableEnergy from Utility.js
 */
app.get("/network", (req, res) => {
  try {
    res.status(200);
    res.json({
      renewableEnergy: utility.getRenewableEnergy(),
      nonRenewableEnergy: utility.getNonRenewableEnergy()
    });
  } catch (err) {
    console.error("GET /network", err.message);
    res.status(400);
    res.send(err);
  }
});

/**
 * GET endpoint returning the transfers of a specific Household and a given day from Utility.js
 * Access this like: http://127.0.0.1:3005/transfers/123456789?from=1122465557 (= Date.now())
 */
app.get("/transfers/:householdAddress", (req, res) => {
  try {
    const { from = 0 } = req.query;
    const householdAddress = web3Utils.toChecksumAddress(
      req.params.householdAddress
    );
    const transfers = utility.getTransfers(householdAddress, from);
    res.status(200);
    res.json(transfers || []);
  } catch (err) {
    console.error("GET /transfers/:householdAddress", err.message);
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
