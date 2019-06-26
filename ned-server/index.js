const express = require("express");
const cors = require("cors");
const commander = require("commander");
const web3Utils = require("web3-utils");

const Utility = require("../utility-js/Utility");
const hhHandler = require("./household-handler");
const zkHandler = require("./zk-handler");
const web3Helper = require("../helpers/web3");
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
  nettingInterval: commander.nettingInterval || serverConfig.nettingInterval,
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

  setInterval(async () => {
    const utilityCopy = { ...utility };
    Object.setPrototypeOf(utilityCopy, Utility.prototype);
    const utilityBeforeNetting = { ...utilityCopy };
    Object.setPrototypeOf(utilityBeforeNetting, Utility.prototype);
    utilityCopy.settle();
    const hash = zkHandler.generateProof(utilityBeforeNetting, utilityCopy);
    console.log(hash);
    // TODO Call contract method of dUtility.sol contract
    // const txReceipt = await dUtilityHandler.sendProof(utilityContract, hash);
    // console.log(txReceipt);
    // TODO Set new utility state on successful verification. E.g. event is emitted.
    utility = utilityCopy;
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
    const { signature, energy } = req.body;

    if (typeof energy !== "number") {
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
        energy,
        signature,
        householdAddress
      ))
    ) {
      throw new Error("Invalid signature");
    }

    utility.addHousehold(householdAddress);
    utility.updateRenewableEnergy(householdAddress, energy);

    res.status(200);
    res.send();
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
