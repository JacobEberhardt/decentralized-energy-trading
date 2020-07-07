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
let nettingActive = false;

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
      if (checkNetting()){
        console.log("Netting Successful!");
        latestBlockNumber = event.blockNumber;
        nettingActive = false;
        transferHandler.collectTransfers(config);
      } else {
        throw "Preimage doesn't Match stored hash. NETTING INVALID"
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

//This module allows to serve auto-generated swagger-ui generated API docs from express.
const expressSwagger = require('express-swagger-generator')(app);

let options = {
    swaggerDefinition: {
        info: {
            description: 'This is the description of the Household Server API',
            title: 'Household Server API',
            version: '1.0.0',
        },
        host: 'localhost:3002',
        basePath: '/',
        produces: [
            "application/json",
            "application/xml"
        ],
        schemes: ['http', 'https'],
        securityDefinitions: {
            JWT: {
                type: 'apiKey',
                in: 'header',
                name: 'Authorization',
                description: "",
            }
        }
    },
    basedir: __dirname, //app absolute path
    files: ['./index.js'] //Path to the API handle folder
};
expressSwagger(options)

/**
 * This function comment is parsed by doctrine
 * @route GET /sensor-stats
 * @group sensor stats - get sensor data between parameter "from" and "to"
 * @param {number} from.query.required - Milliseconds since 1970 (Unix Epoch) for "from date" which user data should be searched - eg: 1590678379000 for "28. May 2020 15:06:19"
 * @param {number} to.query.required - Milliseconds since 1970 (Unix Epoch) for "to date" which user data should be searched - eg: 1590851179000 for "30. May 2020 15:06:19"
 * @returns {object} 200 - An array of sensor data within the specified time period
 * @returns {Error}  default - Unexpected error
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

/**
* This function comment is parsed by doctrine
* @route GET /transfers
* @group transfers - get already transfered energy amounts between parameter "from" and "to"
* @param {number} from.query.required - Milliseconds since 1970 (Unix Epoch) for "from date" which user data should be searched - eg: 1590678379000 for "28. May 2020 15:06:19"
* @param {number} to.query.required - Milliseconds since 1970 (Unix Epoch) for "to date" which user data should be searched - eg: 1590851179000 for "30. May 2020 15:06:19"
* @returns {object} 200 - An array of transfered energy amounts within the specified time period
* @returns {Error}  default - Unexpected error
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
/**
* This function comment is parsed by doctrine
* @route GET /household-stats
* @group household stats - get information for this household server
* @returns {object} 200 - Any information stored within the local DB about this Household Server
* @returns {Error}  default - Unexpected error
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
/**
* This function comment is parsed by doctrine
* @route GET /network-stats
* @group network stats - get information for the current network
* @returns {object} 200 - Any information stored within the local DB about the current network
* @returns {Error}  default - Unexpected error
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
 /**
  * @typedef SensorData
  * @property {integer} meterDelta.body.required - Delta in Watt (10^-6) of sensor data for 15 Minutes that should be stored. For example: -549119 (=-0.549119 Watt) - eg: -549119
  * @property {integer} produce.body.required - Production in Watt of sensor data for 15 Minutes that should be stored. For example: 2400881 (=2.400881 Watt) - eg: 2400881
  * @property {integer} consume.body.required - Consumption in Watt of sensor data that should be stored. For example: 2950000 (=2.95 Watt) - eg: 2950000
  * @property {integer} time.body.required - interval to return readings for, as a UNIX millisecond timestamp. For example: 1594136827000 (=Tuesday, 7. July 2020 15:47:07) - eg: 1594136827000
  */
/**
* This function comment is parsed by doctrine
* @route PUT /sensor-stats
* @group sensor stats - store current sensor data for this Household
* @param {SensorData.model} sensordata.body.required - testing
* @returns {object} 200 - Successful persisted sensor data
* @returns {Error}  default - Unexpected error
*/
app.put("/sensor-stats", async (req, res) => {
  const { meterDelta, produce, consume, time } = req.body;
  try {
    if (
      typeof meterDelta !== "number"
    ) {
      throw new Error("Invalid payload");
    }

    if (!nettingActive) {
      nettingActive = true;
      //TODO: uncomment for production
      //to prevent sending the hash to the parity-chain
      /**await energyHandler.putMeterReading(
        config,
        web3,
        utilityContract,
        meterDelta
      );**/
      console.log(
        'Meter Data stored: meterDelta: '+ meterDelta + ', produce: '+ produce + ', consume: '+ consume + ', time: '+ time
      );

    }

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
    console.error("PUT /sensor-stats", err.message);
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
