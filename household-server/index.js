const express = require("express");
const dbHandler = require("./db-handler");
// const txHandler = require("./transaction-handler");
const mockSensor = require("./mock-sensor-data");

const { host, port, dbUrl, network } = require("../household-server-config");

// Set up the DB
dbHandler.createDB(dbUrl).catch(err => {
  console.log("Error while creating DB", err);
});

// Set up web3

// const web3 = txHandler.initWeb3(network);

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
  const data = mockSensor.createMockData(2, 0, 100);
  // preparing mock data
  const payload = {
    consume: data[0],
    produce: data[1]
  };
  dbHandler.writeToDB(payload, dbUrl).then(result => {
    console.log("Sending Response");
    res.statusCode = 200;
    res.end("Transaction Successfull");
  });
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
