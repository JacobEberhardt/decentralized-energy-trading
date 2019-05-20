const express = require("express");
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
const dbName = serverConfig.dbName;
const sensorDataCollection = serverConfig.sensorDataCollection;
const utilityDataCollection = serverConfig.utilityDataCollection;

// Set up the DB
dbHandler
  .createDB(dbUrl, dbName, [sensorDataCollection, utilityDataCollection])
  .catch(err => {
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
 * PUT request from the sensors
 */
app.put("/", function(req, res, next) {
  const payload = {
    consume: req.body[0],
    produce: req.body[1]
  };
  const blocknumber = 1;

  try {
    txHandler.updateRenewableEnergy(web3, payload).then(() => {
      console.log("Payload sent to the chain");
    });

    txHandler.collectDeeds(web3, blocknumber).then(deeds => {
      dbHandler.writeToDB(deeds, dbUrl, "utility_data");
      console.log("Collected Deeds");
    });

    dbHandler.writeToDB(payload, dbUrl, "sensor_data").then(result => {
      console.log("Sending Response");
      res.statusCode = 200;
      res.end("Transaction Successful");
    });
  } catch (err) {
    throw err;
  }
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
