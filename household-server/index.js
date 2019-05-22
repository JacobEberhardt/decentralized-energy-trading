const express = require("express");
const cors = require("cors");
const commander = require("commander");

const dbHandler = require("./db-handler");
const txHandler = require("./transaction-handler");

const web3Helper = require("../helpers/web3");

const serverConfig = require("../household-server-config");

// Specify cli options
commander
  .option("-h, --host <type>", "ip of household server")
  .option("-p, --port <type>", "port of household server")
  .option("-d, --dbUrl <type>", "url of mongodb")
  .option(
    "-n, --network <type>",
    "network name specified in truffle-config.js"
  );
commander.parse(process.argv);

const host = commander.host || serverConfig.host;
const port = commander.port || serverConfig.port;
const dbUrl = commander.dbUrl || serverConfig.dbUrl;
const network = commander.network || serverConfig.network;

// Set up the DB
dbHandler.createDB(dbUrl).catch(err => {
  console.log("Error while creating DB", err);
});

// Set up web3
const web3 = web3Helper.initWeb3(network);

/**
 * Creating the express server waiting for incoming requests
 * When a request comes in, a corresponding event is emitted
 * At last a response is sent to the requester
 */
const app = express();

app.use(express.json());
app.use(cors());

/**
 * GET request for the UI
 */
app.get("/", function(req, res, next) {
  dbHandler
    .readAll(dbUrl)
    .then(result => {
      console.log("Sending data to Client:\n", result);
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify(result));
    })
    .catch(err => {
      console.log(err);
      res.statusCode = 400;
      res.end("Error occurred:\n", err);
    });
});

/**
 * GET request for the UI
 */
app.get("/household-stats", async (req, res, next) => {
  try {
    const { from, to } = req.query;
    const data = await dbHandler.readAll(dbUrl, "data", { from, to });
    res.setHeader("Content-Type", "application/json");
    res.status(200);
    res.end(JSON.stringify(data));
  } catch (error) {
    console.log(error);
    res.statusCode = 500;
    res.end("Error occurred:\n", error);
  }
});

/**
 * PUT request from the sensors
 */
app.put("/", function(req, res, next) {
  const payload = {
    consume: req.body[0],
    produce: req.body[1]
  };

  console.log(payload);
  dbHandler.writeToDB(payload, dbUrl).then(() => {
    console.log("Sending Response");
    res.statusCode = 200;
    res.end("Transaction Successfull");
  });
  txHandler.updateRenewableEnergy(web3, payload);
});

/**
 * POST request not supported
 */
app.post("/", function(req, res, next) {
  res.statusCode = 400;
  res.end(
    req.method +
      " is not supported. Try GET for UI Requests or PUT for Sensor data!\n"
  );
});

/**
 * DELETE request not supported
 */
app.delete("/", function(req, res, next) {
  res.statusCode = 400;
  res.end(
    req.method +
      " is not supported. Try GET for UI Requests or PUT for Sensor data\n"
  );
});

/**
 * Let the server listen to incoming requests on the given IP:Port
 */
app.listen(port, () => {
  console.log(`Household Server running at http://${host}:${port}/`);
});
