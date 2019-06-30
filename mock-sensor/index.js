const serverConfig = require("../household-server-config");
const http = require("http");
const commander = require("commander");
const dataGenerator = require("./data-generator");

/**
 * CLI interface for the Mock-Sensor
 */
commander
  .option("-h, --host <type>", "ip of household server")
  .option("-p, --port <type>", "port of household server")
  .option("-r, --route <type>", "route/path of household server")
  .option("-i, --interval <type>", "time interval of the of the sensor in ms")
  .option(
    "-m, --mode <Number>",
    "operation mode: 1 for produce & consume values, 2 for continous meter reading"
  )
  .option(
    "-s, --startValue <Number>",
    "starting value of the meter in case of single continous meter reading"
  )
  .option(
    "-e, --energybalance <type>",
    "+ for energy consumption < production, - for consumption > production, = for consumption = production"
  );
commander.parse(process.argv);

const host = commander.host || serverConfig.host;
const port = commander.port || serverConfig.port;
const path = commander.endpoint || "/sensor-stats";
const sensorInterval = commander.interval || serverConfig.sensorInterval;
const energyBalance = commander.energybalance || "=";
const mode = Number(commander.mode) || serverConfig.sensorMode;
let currentMeterReading = Number(commander.startValue) || 0;

/**
 * Importing the regular consume and produce factors based on the given energy balance
 */
const {
  regularConsumeFactor,
  regularProduceFactor
} = dataGenerator.getEnergyFactor(energyBalance);

/**
 * Importing the energy consumption and production value sets from the config data
 */
const { energyConsumption, energyProduction } = require("./sensor-config");

console.log(
  `Starting Mock-Sensor\nSending to http://${host}:${port}${path} with an interval of ${sensorInterval}ms.`
);

/**
 * Options for the Mock-Sensor. Should use the PUT method, as POST is not supported by the Household Server
 * Retrieves host and port from the household-server-config.js file in Root
 */
const options = {
  hostname: host,
  port: port,
  method: "PUT",
  path: path,
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
  // const currentHour = currentDate.getSeconds()/2; // For Testing purposes

  /**
   * The total factors contain the regular factors added to a sin function from [0, pi].
   * This smoothens the curve a little bit
   */
  const consumeFactor =
    Math.sin((currentHour / 24) * Math.PI) + regularConsumeFactor;
  const produceFactor =
    Math.sin((currentHour / 24) * Math.PI) + regularProduceFactor;
  let payload = {};

  /**
   * From 0am to 6am
   * The ernergy consumption is low
   * The energy production is none (Night time = no Sun)
   */
  if (currentHour < 6) {
    payload = dataGenerator.getGaussianMockData(
      energyConsumption.low * consumeFactor,
      energyProduction.low * produceFactor
    );

    /**
     * From 6am to 10am
     * The ernergy consumption is normal
     * The energy production is normal
     */
  } else if (currentHour >= 6 && currentHour < 10) {
    payload = dataGenerator.getGaussianMockData(
      energyConsumption.normal * consumeFactor,
      energyProduction.normal * produceFactor
    );
    /**
     * From 10am to 5pm
     * The ernergy consumption is normal
     * The energy production is high
     */
  } else if (currentHour >= 10 && currentHour < 17) {
    payload = dataGenerator.getGaussianMockData(
      energyConsumption.normal * consumeFactor,
      energyProduction.high * produceFactor
    );
    /**
     * From 5am to 10pm
     * The ernergy consumption is high
     * The energy production is normal
     */
  } else if (currentHour >= 17 && currentHour < 22) {
    payload = dataGenerator.getGaussianMockData(
      energyConsumption.high * consumeFactor,
      energyProduction.normal * produceFactor
    );
    /**
     * From 10pm to 12pm
     * The ernergy consumption is normal
     * The energy production is low
     */
  } else if (currentHour >= 22 && currentHour <= 24) {
    payload = dataGenerator.getGaussianMockData(
      energyConsumption.normal * consumeFactor,
      energyProduction.low * produceFactor
    );
  }

  // if continous meter reading mode is active, we calculate the new meter reading by adding (produce - consume)
  // then we reset the payload
  if (mode === 2) {
    currentMeterReading +=
      Number(payload["produce"]) - Number(payload["consume"]);
    payload = { meterReading: currentMeterReading };
  }
  /**
   * Sending the request with the payload to the Household server
   */
  console.log(payload);
  req.end(JSON.stringify(payload));
}, sensorInterval);
