const express = require("express");
const fs = require("fs");
const cors = require("cors");
const commander = require("commander");
const db = require("./apis/db");
const ned = require("./apis/ned");
const blockchain = require("./apis/blockchain");
const transferHandler = require("./transfer-handler");
const energyHandler = require("./energy-handler");
const request = require("request-promise");
const web3Helper = require("../helpers/web3");
const zokratesHelper = require("../helpers/zokrates");
const contractHelper = require("../helpers/contract");
const serverConfig = require("../household-server-config");

// Specify cli options
commander
  .option("-h, --host <type>", "ip of household server")
  .option("-p, --port <type>", "port of household server")
  .option("-d, --dbUrl <type>", "url of mongodb")
  .option("-N, --nedUrl <type>", "url of NED server")
  .option("-a, --address <type>", "address of the parity account")
  .option("-P, --password <type>", "password of the parity account")
  .option("-i, --interval <milliseconds>", "billing interval")
  .option(
    "-n, --network <type>",
    "network name specified in truffle-config.js"
  );
commander.parse(process.argv);

// Configuration wrapper
const config = {
  host: commander.host || serverConfig.host,
  port: commander.port || serverConfig.port,
  dbUrl: commander.dbUrl || serverConfig.dbUrl,
  nedUrl: commander.nedUrl || serverConfig.nedUrl,
  network: commander.network || serverConfig.network,
  address: commander.address || serverConfig.address,
  password: commander.password || serverConfig.password,
  sensorInterval: commander.interval || serverConfig.sensorInterval,
  dbName: serverConfig.dbName,
  sensorDataCollection: serverConfig.sensorDataCollection,
  utilityDataCollection: serverConfig.utilityDataCollection,
  meterReadingCollection: serverConfig.meterReadingCollection
};

// Set up the DB
db.createDB(config.dbUrl, config.dbName, [
  config.sensorDataCollection,
  config.utilityDataCollection,
  config.meterReadingCollection
])

let web3;
let utilityContract;
let latestBlockNumber;

async function init() {
  web3 = web3Helper.initWeb3(config.network);
  latestBlockNumber = await web3.eth.getBlockNumber();
  utilityContract = new web3.eth.Contract(
    contractHelper.getAbi("dUtility"),
    contractHelper.getDeployedAddress("dUtility", await web3.eth.net.getId())
  );
  utilityContract.events.NettingSuccess(
    {
      fromBlock: latestBlockNumber
    },
    (error, event) => {
      if (error) {
        console.error(error.message);
        throw error;
      }
      if (checkNetting()) {
        console.log("Netting Successful:", event);
        latestBlockNumber = event.blockNumber;
        transferHandler.collectTransfers(config);
      } else {
        throw new Error("Preimage doesn't Match stored hash. NETTING INVALID");
      }
    }
  );
}

init();

/**
 * function for retrieving meterDelta from ned-server and checks if it's the correct preimage for meterDelta. Needed for households to validate netting
 */
async function checkNetting(){
  const randomHash = zokratesHelper.packAndHash(Math.floor(Math.random() * Math.floor(999999999)));
  const { data, signature } = await web3Helper.signData(web3, config.address, config.password, randomHash)

  const options = {
    uri: `${config.nedUrl}/meterdelta`,
    json: true,
    qs: {
      hash: data,
      signature: signature
    }
  }
  return await request(options)
    .then((res, err) => {
      const meterDeltaHash = blockchain.getAfterNettingHash(config.network, config.address, config.password)
      return zokratesHelper.packAndHash(res.meterDelta) != meterDeltaHash
    })
}

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
    const data = await db.readAll(
      config.dbUrl,
      config.dbName,
      config.sensorDataCollection,
      {
        ...fromQuery,
        ...toQuery
      }
    );
    res.setHeader("Content-Type", "application/json");
    res.status(200);
    res.json(data);
  } catch (error) {
    console.error("GET /sensor-stats", error.message);
    res.status(500);
    res.end(error);
  }
});

/**
 * GET /transfers?from=<fromDate>&to=<toDate>
 */
app.get("/transfers", async (req, res) => {
  try {
    const { from, to } = req.query;
    const fromQuery = from ? { timestamp: { $gte: parseInt(from) } } : {};
    const toQuery = to ? { timestamp: { $lte: parseInt(to) } } : {};
    const data = await db.readAll(
      config.dbUrl,
      config.dbName,
      config.utilityDataCollection,
      {
        ...fromQuery,
        ...toQuery
      }
    );
    res.setHeader("Content-Type", "application/json");
    res.status(200);
    res.json(data);
  } catch (error) {
    console.error("GET /transfers", error.message);
    res.status(500);
    res.end(error);
  }
});

/**
 * GET /household-stats
 */
app.get("/household-stats", async (req, res, next) => {
  try {
    const data = await db.getMeterReading(config.dbUrl, config.dbName, config.meterReadingCollection);
    data.address = config.address;
    res.setHeader("Content-Type", "application/json");
    res.status(200);
    res.json(data);
  } catch (error) {
    console.error("GET /household-stats", error.message);
    res.status(500);
    res.end(error);
  }
});

/**
 * GET /network-stats
 */
app.get("/network-stats", async (req, res, next) => {
  try {
    const data = await ned.getNetwork(config.nedUrl, config.address);
    res.setHeader("Content-Type", "application/json");
    res.status(200);
    res.json(data);
  } catch (error) {
    console.error("GET /network-stats", error.message);
    res.status(500);
    res.end(error);
  }
});

/**
 * PUT /sensor-stats
 */
app.put("/sensor-stats", async (req, res) => {
  const { meterDelta, produce, consume } = req.body;
  try {
    if (
      typeof meterDelta !== "number"
    ) {
      throw new Error(`Invalid payload: meterDelta=${meterDelta}`);
    }

    await energyHandler.putMeterReading(
      config,
      web3,
      utilityContract,
      meterDelta
    );

    await db.writeToDB(
      config.dbUrl,
      config.dbName,
      config.sensorDataCollection,
      {
        produce,
        consume
      }
    )
    .then(res => {
      db.updateMeterReading(config.dbUrl, config.dbName, config.meterReadingCollection, res)
    })

    res.status(200);
    res.send();
  } catch (err) {
    console.error("GET /sensor-stats", err.message);
    res.status(500);
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
app.listen(config.port, () => {
  console.log(
    `Household Server running at http://${config.host}:${config.port}/`
  );
  console.log(`I am authority node ${config.address}.`);
});
