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
app.use(cors());

/**
 * GET /sensor-stats?from=<fromDate>&to=<toDate>
 */
app.get("/sensor-stats", async (req, res) => {
  try {
    const { from, to } = req.query;
    const fromQuery = from ? { timestamp: { $gte: parseInt(from) } } : {};
    const toQuery = to ? { timestamp: { $lte: parseInt(to) } } : {};
    const data = await dbHandler.readAll(dbUrl, dbName, sensorDataCollection, {
      ...fromQuery,
      ...toQuery
    });
    res.setHeader("Content-Type", "application/json");
    res.status(200);
    res.end(JSON.stringify(data));
  } catch (error) {
    console.log(error);
    res.status(500);
    res.end(error);
  }
});

/**
 * GET /deeds?from=<fromDate>&to=<toDate>
 */
app.get("/deeds", async (req, res) => {
  try {
    const { from, to } = req.query;
    const fromQuery = from ? { timestamp: { $gte: parseInt(from) } } : {};
    const toQuery = to ? { timestamp: { $lte: parseInt(to) } } : {};
    const data = await dbHandler.readAll(dbUrl, dbName, utilityDataCollection, {
      ...fromQuery,
      ...toQuery
    });
    res.setHeader("Content-Type", "application/json");
    res.status(200);
    res.end(JSON.stringify(data));
  } catch (error) {
    console.log(error);
    res.status(500);
    res.end(error);
  }
});

/**
 * GET /household-stats
 */
app.get("/household-stats", async (req, res, next) => {
  try {
    const data = await txHandler.getHousehold(web3);
    res.setHeader("Content-Type", "application/json");
    res.status(200);
    res.end(JSON.stringify(data));
  } catch (error) {
    console.log(error);
    res.status(500);
    res.end(error);
  }
});

/**
 * GET /network-stats
 */
app.get("/network-stats", async (req, res, next) => {
  try {
    const data = await txHandler.getNetworkStats(web3);
    res.setHeader("Content-Type", "application/json");
    res.status(200);
    res.end(JSON.stringify(data));
  } catch (error) {
    console.log(error);
    res.status(500);
    res.end(error);
  }
});

/**
 * PUT /
 */
app.put("/", async (req, res) => {
  const { produce, consume } = req.body;
  try {
    if (typeof produce !== "number" || typeof consume !== "number") {
      throw new Error("Invalid payload");
    }

    // TODO: Source out in separate handler file
    const handleDeeds = async () => {
      const latestSavedBlockNumber = await dbHandler.getLatestBlockNumber(
        dbUrl,
        dbName,
        utilityDataCollection
      );
      const deeds = await txHandler.collectDeeds(
        web3,
        latestSavedBlockNumber + 1
      );
      return deeds.length > 0
        ? dbHandler.bulkWriteToDB(dbUrl, dbName, utilityDataCollection, deeds)
        : [];
    };

    // TODO: Handle case where one promise rejects (i.e. tx fails)
    await Promise.all([
      handleDeeds(),
      txHandler.updateRenewableEnergy(web3, {
        produce,
        consume
      }),
      dbHandler.writeToDB(dbUrl, dbName, sensorDataCollection, {
        produce,
        consume
      })
    ]);
    res.status(200);
    res.send();
  } catch (err) {
    res.status = 400;
    res.send(err);
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
