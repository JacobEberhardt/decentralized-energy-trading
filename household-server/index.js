const http = require("http");
const events = require("events");
const dbhandler = require("./db-handler");
// const txhandler = require("./transaction-handler");
const MockData = require("./mock-sensor-data");

// Setting up the DB
var url = "mongodb://localhost:27017/sensordata/";
dbhandler.createDB(url);

// Config of server
const hostname = "127.0.0.1";
const port = 3000;

// Defining Events
const EVENTS = {
  SENSOR_INPUT: "sensor_input",
  UI_REQUEST: "ui_request"
};

// Adding Event Listener
var em = new events.EventEmitter();
em.on(EVENTS.SENSOR_INPUT, dbhandler.writetoDB);
em.on(EVENTS.UI_REQUEST, dbhandler.readall);
// em.on(EVENTS.SENSOR_INPUT, txhandler);

/**
 * Creating the http server waiting for incoming requests
 * When a request comes in, a corresponding event is emitted
 * At last a response is sended to the requester
 */
const server = http.createServer((req, res) => {
  console.log(req.method, "Request received");
  var statusmsg = "";

  switch (req.method) {
    // Get requests from the UI
    case "GET":
      em.emit(EVENTS.UI_REQUEST, url);
      res.statusCode = 200;
      statusmsg = "Success";
      break;

    // PUT Requests from the Sensors
    case "PUT":
      let data = MockData.createMockData(2, 0, 100);
      // preparing mock data
      let mockobj = {
        consume: data[0],
        produce: data[1]
      };

      em.emit(EVENTS.SENSOR_INPUT, mockobj, url);
      res.statusCode = 200;
      statusmsg = "Success";
      break;

    // Default for any other
    default:
      res.statusCode = 400;
      statusmsg =
        req.method +
        " is not supported. Try GET for UI Requests or PUT for Sensor data\n";
      break;
  }

  // Sending Response
  console.log("Sending response");
  res.setHeader("Content-Type", "text/plain");
  res.end(statusmsg);
});

/**
 * Let the server listen to incoming requests on the given IP:Port
 */
server.listen(port, hostname, () => {
  console.log(`Household Server running at http://${hostname}:${port}/`);
});
