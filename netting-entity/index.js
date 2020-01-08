const express = require("express");
const cors = require("cors");
const commander = require("commander");
const web3Utils = require("web3-utils");
const shell = require("shelljs");
const fs = require("fs");
const Utility = require("./utility");
const hhHandler = require("./household-handler");
const zkHandler = require("./zk-handler");
const { getBillingPeriod } = require("../helpers/billing-cycles");
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
/** @type {{[householdAddress: number]: Utility}} */
const utilities = {};
let ownedSetContract;
let utilityContract;
let latestBlockNumber;

async function init() {
  web3 = web3Helper.initWeb3(config.network);
  latestBlockNumber = await web3.eth.getBlockNumber();
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
      // TODO: unlock corresponding receipts in HTTP API
    }
  );

  async function runBillingPeriod(billingPeriod) {
    console.log(`End of billing period ${billingPeriod}. Waiting for meter readings...`);
    const utility = getOrCreateUtilityForBillingPeriod(billingPeriod);

    // wait for households to send meter readings
    let timeoutHandle = null;
    await new Promise(resolve => {
      // wait for the earliest of either:
      // timeout, ...
      timeoutHandle = setTimeout(resolve, config.nettingInterval);
      // ... or having received all readings
      utility.onAllReadingsReceived(resolve);
    });
    clearTimeout(timeoutHandle);
    console.log(`End of grace period ${billingPeriod}. Starting netting...`);

    if (utility.getHouseholdAddressesProducers().length <= 0
      && utility.getHouseholdAddressesConsumers().length <= 0
    ) {
      console.log(`Skipping billing period ${billingPeriod}: No households submitted meter readings.`);
      return;
    }

    let utilityBeforeNetting = JSON.parse(JSON.stringify(utility)); // dirty hack for obtaining deep copy of utility
    Object.setPrototypeOf(utilityBeforeNetting, Utility.prototype);

    const utilityAfterNetting = utility; // alias for readability. utility is not referenced hereafter, so we can skip the deep copying.
    utilityAfterNetting.settle();

    console.log("Utility before Netting: ", utilityBeforeNetting)
    console.log("Utility after Netting: ", utilityAfterNetting)

    let { hhAddresses, proofData: data } = await zkHandler.generateProof(
      utilityBeforeNetting,
      utilityAfterNetting,
      "production_mode"
    );

    if (hhAddresses.length <= 0) {
      console.log("No households to hash.");
      return;
    }

    await web3.eth.personal.unlockAccount(
      config.address,
      config.password,
      null
    );
    utilityContract.methods
      .checkNetting(
        billingPeriod,
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
      });

    // TODO: after some time (e.g., all clients fetched their receipts), remove utility for this billing period, to free up the used memory
  }

  console.log(`Running with netting interval of ${config.nettingInterval}`);
  let prevBillingPeriod = 0;
  setInterval(() => {
    const billingPeriod = getBillingPeriod(config.nettingInterval);
    // Don't run a billing period twice if there's a timing issue.
    // Skipping periods is ok, the system model provides a safe fallback.
    if (billingPeriod > prevBillingPeriod) {
      runBillingPeriod(billingPeriod);
      prevBillingPeriod = billingPeriod;
    }
  }, config.nettingInterval);
}

function getOrCreateUtilityForTimestamp(timestampMs) {
  return getOrCreateUtilityForBillingPeriod(getBillingPeriod(config.nettingInterval, timestampMs));
}

function getOrCreateUtilityForBillingPeriod(billingPeriod) {
  let utility = utilities[billingPeriod];
  if (!utility) {
    utility = new Utility(billingPeriod);
    utilities[billingPeriod] = utility;
  }
  return utility;
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

    const recoveredAddress = await web3Helper.verifySignature(
      web3,
      hash,
      signature
    );
    if (recoveredAddress != householdAddress) {
      throw new Error("Invalid signature");
    }

    const utility = getOrCreateUtilityForTimestamp(timestamp);

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
    // TODO: /network API is broken for now; track current energy balance separately from billing period data
    const utility = utilities[getBillingPeriod(config.nettingInterval)]; // return dummy data from current billing period only
    if (!utility) throw new Error(`No current billing period`);
    res.status(200);
    res.json({
      renewableEnergy: utility.renewableEnergy,
      nonRenewableEnergy: utility.nonRenewableEnergy
    });
  } catch (err) {
    console.error("GET /network", err.message);
    res.status(400);
    res.send(err);
  }
});

/**
 * GET endpoint returning the current meterDelta of a household that provides a valid signature for the account
 */
app.get("/meterdelta", async (req, res) => {
  try {
    const { signature, hash } = req.query;
    const recoveredAddress = await web3Helper.verifySignature(web3, hash, signature)
    const validHouseholdAddress = await hhHandler.isValidatorAddress(
      ownedSetContract,
      recoveredAddress
    );
    if (!validHouseholdAddress) {
      throw new Error("Given address is not a validator");
    }
    const nowMs = Date.now()
    const utility = utilities[getBillingPeriod(config.nettingInterval, nowMs)];
    if (!utility) throw new Error(`No billing period for time ${nowMs}`);

    res.status(200);
    res.json({meterDelta: utility.households[recoveredAddress].meterDelta });
  } catch (err) {
    console.error("GET /meterdelta", err.message);
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
    // TODO: /transfers API is broken for now; track transfers separately from billing period data
    const utility = utilities[getBillingPeriod(config.nettingInterval)]; // return dummy data from current billing period only
    if (!utility) throw new Error(`No billing period for time ${from}`);
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
  console.log(`Netting Entity running at http://${config.host}:${config.port}/`);
});
