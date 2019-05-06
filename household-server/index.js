const http = require("http");
const events = require("events");

const dbHandler = require("./db-handler");
const txHandler = require("./transaction-handler");
const mockSensor = require("./mock-sensor-data");

const { host, port, dbUrl } = require("./config");

// Set up the DB
dbHandler.createDB(dbUrl);

// Set up web3
const web3 = txHandler.initWeb3();

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
 * Creating the http server waiting for incoming requests
 * When a request comes in, a corresponding event is emitted
 * At last a response is sended to the requester
 */
const server = http.createServer((req, res) => {
  console.log(req.method, "Request received");
  let statusMsg = "";

  switch (req.method) {
    // Get requests from the UI
    case "GET":
      eventEmitter.emit(EVENTS.UI_REQUEST, dbUrl);
      res.statusCode = 200;
      statusMsg = "Success";
      break;

    // PUT Requests from the Sensors
    case "PUT":
      const data = mockSensor.createMockData(2, 0, 100);
      // preparing mock data
      const payload = {
        consume: data[0],
        produce: data[1]
      };

      eventEmitter.emit(EVENTS.SENSOR_INPUT, payload);
      res.statusCode = 200;
      statusMsg = "Success";
      break;

    // Default for any other
    default:
      res.statusCode = 400;
      statusMsg =
        req.method +
        " is not supported. Try GET for UI Requests or PUT for Sensor data\n";
      break;
  }

  // Sending Response
  console.log("Sending response");
  res.setHeader("Content-Type", "text/plain");
  res.end(statusMsg);
});

/**
 * Let the server listen to incoming requests on the given IP:Port
 */
server.listen(port, host, () => {
  console.log(`Household Server running at http://${host}:${port}/`);
});
