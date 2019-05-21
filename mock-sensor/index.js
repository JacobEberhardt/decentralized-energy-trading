const serverConfig = require("../household-server-config");
const http = require("http");
const commander = require("commander");

commander
  .option("-h, --host <type>", "ip of household server")
  .option("-p, --port <type>", "port of household server")
  .option("-i, --interval <type>", "time interval of the of the sensor in ms");
commander.parse(process.argv);

const host = commander.host || serverConfig.host;
const port = commander.port || serverConfig.port;
const sensorInterval = commander.interval || serverConfig.sensorInterval;

console.log(
  `Starting Mock-Sensor\nSending to http://${host}:${port} with an interval of ${sensorInterval}ms`
);

/**
 * This function draws random samples from an uniform distribution.
 * @param {Number} samples Amount of Samples to draw from the random distribution
 * @param {Number} min Minimum value of the random distribution
 * @param {Number} max Maximum value of the random distribution
 * @returns {Object}
 */
const getMockData = (samples, min, max) => {
  let mockData = {};
  for (let i = 0; i < samples; i++) {
    let rndm = Math.random() * (max - min) + min;
    // rounding the samples
    rndm = Math.round(rndm * 100) / 100;
    mockData[i] = rndm;
  }
  return mockData;
};

/**
 * Options for the Mock-Sensor. Should use the PUT method, as POST is not supported by the Household Server
 * Retrieves host and port from the household-server-config.js file in Root
 */
const options = {
  hostname: host,
  port: port,
  method: "PUT",
  headers: {
    "Content-Type": "application/json"
  }
};

/**
 * Periodically sends a HTTP request with the mock data to the Household Server.
 * The interval is defined in household-server-config.js
 */
setInterval(() => {
  const req = http.request(options, res => {
    console.log(`statusCode: ${res.statusCode}`);

    res.on("data", d => {
      process.stdout.write(d);
    });
  });

  req.on("error", error => {
    console.error(error);
  });
  const payload = getMockData(2, 0, 100);
  console.log("Sending data:", payload);
  req.end(JSON.stringify(payload));
}, sensorInterval);
