const express = require("express");
const events = require("events");
const commander = require("commander");

const dbHandler = require("./db-handler");
const txHandler = require("./transaction-handler");
const mockSensor = require("./mock-sensor-data");

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
dbHandler.createDB(dbUrl);

// Set up web3

const web3 = txHandler.initWeb3(network);

// Defining Events
const EVENTS = {
  SENSOR_INPUT: "sensor_input",
  UI_REQUEST: "ui_request"
};

// Adding Event Listener
const eventEmitter = new events.EventEmitter();
eventEmitter.on(EVENTS.UI_REQUEST, () => dbHandler.readAll(dbUrl));
eventEmitter.on(EVENTS.SENSOR_INPUT, payload =>
  dbHandler.writeToDB(payload, dbUrl)
);
eventEmitter.on(EVENTS.SENSOR_INPUT, payload =>
  txHandler.updateRenewableEnergy(web3, payload)
);

/**
 * Creating the express server waiting for incoming requests
 * When a request comes in, a corresponding event is emitted
 * At last a response is sent to the requester
 */
const app = express();

/**
 * GET request for the UI
 */
app.get("/", function(req, res, next) {
  eventEmitter.emit(EVENTS.UI_REQUEST, dbUrl);
  res.statusCode = 200;
  res.end("Success");
});

/**
 * PUT request from the sensors
 */
app.put("/", function(req, res, next) {
  const data = mockSensor.createMockData(2, 0, 100);
  // preparing mock data
  const payload = {
    consume: data[0],
    produce: data[1]
  };

  eventEmitter.emit(EVENTS.SENSOR_INPUT, payload);
  res.statusCode = 200;
  res.end("Success");
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
