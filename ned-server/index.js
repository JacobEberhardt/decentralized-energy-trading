const express = require("express");
const cors = require("cors");
const commander = require("commander");
const web3Utils = require("web3-utils");
const shell = require("shelljs");

const Utility = require("../utility-js/Utility");
const hhHandler = require("./household-handler");
const zkHandler = require("./zk-handler");
const web3Helper = require("../helpers/web3");
const contractHelper = require("../helpers/contract");
const { ZERO_ADDRESS } = require("../helpers/constants");

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
let utility;
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
      console.log("NettingSuccess event", event);
      latestBlockNumber = event.blockNumber;
      utility = utilityAfterNetting;
    }
  );

  utilityContract.events.CheckHashesSuccess(
    {
      fromBlock: latestBlockNumber
    },
    async (error, event) => {
      if (error) {
        console.error(error.msg);
        throw error;
      }
      console.log("CheckHashesSuccess event", event);
      latestBlockNumber = event.blockNumber;
      const { proof, inputs } = require("../zokrates-code/proof.json");
      await web3.eth.personal.unlockAccount(
        config.address,
        config.password,
        null
      );
      utilityContract.methods
        .verifyNetting(proof.a, proof.b, proof.c, inputs)
        .send({ from: config.address }, (error, txHash) => {
          if (error) {
            console.error(error);
            throw error;
          }
          console.log("dUtility.verifyNetting txHash", txHash);
        });
    }
  );

  async function runZokrates() {
    const utilityBeforeNetting = { ...utility };
    Object.setPrototypeOf(utilityBeforeNetting, Utility.prototype);
    utilityAfterNetting = { ...utility };
    Object.setPrototypeOf(utilityAfterNetting, Utility.prototype);
    utilityAfterNetting.settle();
    const hhAddressToHash = zkHandler.generateProof(
      utilityBeforeNetting,
      utilityAfterNetting
    );
    delete hhAddressToHash[ZERO_ADDRESS];
    if (Object.keys(hhAddressToHash).length > 0) {
      await web3.eth.personal.unlockAccount(
        config.address,
        config.password,
        null
      );
      utilityContract.methods
        .checkHashes(
          Object.keys(hhAddressToHash),
          Object.values(hhAddressToHash).map(hexHash =>
            web3Utils.hexToBytes(hexHash)
          )
        )
        .send({ from: config.address }, (error, txHash) => {
          if (error) {
            console.error(error.message);
            throw error;
          }
          console.log("dUtility.checkHashes txHash", txHash);
        });
    }
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
 * GET endpoint returning the current energy balance of the requested Household form Utility.js
 */
app.get("/household/:householdAddress", (req, res) => {
  try {
    const householdAddress = web3Utils.toChecksumAddress(
      req.params.householdAddress
    );
    const energyBalance = utility.getHousehold(householdAddress);
    res.status(200);
    res.json(energyBalance);
  } catch (err) {
    console.error("GET /household/:householdAddress", err.message);
    res.status(400);
    res.send(err);
  }
});

/**
 * GET endpoint returning the deeds of a specific Household and a given day from Utility.js
 * Access this like: http://127.0.0.1:3005/deeds/123456789?from=1122465557 (= Date.now())
 */
app.get("/deeds/:householdAddress", (req, res) => {
  try {
    const { from = 0 } = req.query;
    const householdAddress = web3Utils.toChecksumAddress(
      req.params.householdAddress
    );
    const deeds = utility.getDeeds(householdAddress, from);
    res.status(200);
    res.json(deeds || []);
  } catch (err) {
    console.error("GET /deeds/:householdAddress", err.message);
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
