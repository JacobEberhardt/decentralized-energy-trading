const express = require("express");
const cors = require("cors");
const commander = require("commander");

// const txHandler = require("./transaction-handler");
// const web3Helper = require("../helpers/web3");

const serverConfig = require("../ned-server-config");

// Specify cli options
commander
  .option("-h, --host <type>", "ip of ned server")
  .option("-p, --port <type>", "port of ned server")
  .option("-n, --netting <type>", "interval of the netting")
  .option(
    "-n, --network <type>",
    "network name specified in truffle-config.js"
  );
commander.parse(process.argv);

const nettingInterval =
  commander.nettingInterval || serverConfig.nettingInterval;
const host = commander.host || serverConfig.host;
const port = commander.port || serverConfig.port;
// const network = commander.network || serverConfig.network;

// Set up web3
//  const web3 = web3Helper.initWeb3(network);

/**
 * Creating the express server waiting for incoming requests
 * When a request comes in, a corresponding event is emitted
 * At last a response is sent to the requester
 */
const app = express();

app.use(express.json());
app.use(cors());

// Declaring the saved household transactions
const householdTransactions = {};

/**
 * PUT /household-transactions
 */
app.put("/household-transactions", async (req, res) => {
  const { meterReading, householdAddress } = req.body;
  try {
    console.log(meterReading, householdAddress);
    if (typeof meterReading !== "number") {
      throw new Error("Invalid payload");
    }
    if (householdAddress == null) {
      // TODO check if address is valid with the Validator Set
      throw new Error("Invalid address");
    }
    // Check if the household has already sent a transaction in the current netting span
    if (householdTransactions.hasOwnProperty(householdAddress)) {
      console.log("Already sent");
      throw new Error("Transaction is already sent");
    }

    // Adding the meter Reading of the Household to the household transactions
    householdTransactions[householdAddress] = meterReading;

    console.log(householdTransactions);
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
app.listen(port, () => {
  console.log(`NED Server running at http://${host}:${port}/`);
});

setInterval(() => {
  // TODO call ZoKrates bash file
  console.log("Calling ZoKrates to perform some magic");
  manageNetting();
}, nettingInterval);

/**
 * Async function to manage the netting process:
 * Step 1: Trigger the zokrates execution via the zk-handler
 * Step 2: Send Proof to the Utility contracs via the tx Handler
 * */
const manageNetting = async () => {
  console.log("Manage Netting");
};
