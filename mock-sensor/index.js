const serverConfig = require("../household-server-config");
const http = require("http");
const commander = require("commander");
const dataGenerator = require("./data-generator");
const { energyConsumption, energyProduction } = require("./sensor-config");

commander
  .option("-h, --host <type>", "ip of household server")
  .option("-p, --port <type>", "port of household server")
  .option("-i, --interval <type>", "time interval of the of the sensor in ms")
  .option(
    "-e, --energybalance <type>",
    "+ for energy consumption < production, - for consumption > production, = for consumption = production"
  );
commander.parse(process.argv);

const host = commander.host || serverConfig.host;
const port = commander.port || serverConfig.port;
const sensorInterval = commander.interval || serverConfig.sensorInterval;
const energyBalance = commander.energybalance || "=";

const { consumeFactor, produceFactor } = dataGenerator.getEnergyFactor(
  energyBalance
);

console.log(
  `Starting Mock-Sensor\nSending to http://${host}:${port} with an interval of ${sensorInterval}ms`
);

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

  const currentDate = new Date();
  const currentHour = currentDate.getHours();
  let payload = {};

  if (currentHour < 6) {
    payload = dataGenerator.getGaussianMockData(
      energyConsumption.low * consumeFactor,
      energyProduction.low * produceFactor
    );
  }
  if (currentHour >= 6 && currentHour < 10) {
    payload = dataGenerator.getGaussianMockData(
      energyConsumption.normal * consumeFactor,
      energyProduction.normal * produceFactor
    );
  }
  if (currentHour >= 10 && currentHour < 17) {
    payload = dataGenerator.getGaussianMockData(
      energyConsumption.normal * consumeFactor,
      energyProduction.high * produceFactor
    );
  }
  if (currentHour >= 17 && currentHour < 22) {
    payload = dataGenerator.getGaussianMockData(
      energyConsumption.high * consumeFactor,
      energyProduction.normal * produceFactor
    );
  }
  if (currentHour >= 22 && currentHour < 24) {
    payload = dataGenerator.getGaussianMockData(
      energyConsumption.normal * consumeFactor,
      energyProduction.low * produceFactor
    );
  }

  console.log("Sending data:", payload);
  req.end(JSON.stringify(payload));
}, sensorInterval);
