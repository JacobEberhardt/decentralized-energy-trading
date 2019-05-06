const http = require("http");
const events = require("events");
const dbHandler = require("./db-handler");
// const txHandler = require("./transaction-handler");
const mockSensor = require("./mock-sensor-data");

// Setting up the DB
const url = "mongodb://localhost:27017/sensordata/";
dbHandler.createDB(url);

// Config of server
const hostname = "127.0.0.1";
const port = 3000;

// Defining Events
const EVENTS = {
  SENSOR_INPUT: "sensor_input",
  UI_REQUEST: "ui_request"
};

// Adding Event Listener
const eventEmitter = new events.EventEmitter();
eventEmitter.on(EVENTS.SENSOR_INPUT, dbHandler.writeToDB);
eventEmitter.on(EVENTS.UI_REQUEST, dbHandler.readAll);
// em.on(EVENTS.SENSOR_INPUT, txHandler);

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
      eventEmitter.emit(EVENTS.UI_REQUEST, url);
      res.statusCode = 200;
      statusMsg = "Success";
      break;

    // PUT Requests from the Sensors
    case "PUT":
      let data = mockSensor.createMockData(2, 0, 100);
      // preparing mock data
      let mockobj = {
        consume: data[0],
        produce: data[1]
      };

      eventEmitter.emit(EVENTS.SENSOR_INPUT, mockobj, url);
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
server.listen(port, hostname, () => {
  console.log(`Household Server running at http://${hostname}:${port}/`);
});
