const express = require("express");
const cors = require("cors");
const commander = require("commander");
const web3Utils = require("web3-utils");
const shell = require("shelljs");
const fs = require('fs');
const Utility = require("../utility-js/Utility");
const hhHandler = require("./household-handler");
const zkHandler = require("./zk-handler");
const web3Helper = require("../helpers/web3");
const { ZERO_ADDRESS } = require("../helpers/constants");
const path = require("path");

const serverConfig = require("../ned-server-config");

// Specify cli options
commander
  .option("-h, --host <type>", "ip of ned server")
  .option("-p, --port <type>", "port of ned server")
  .option("-i, --interval <type>", "interval of the netting")
  .option(
    "-n, --network <type>",
    "network name specified in truffle-config.js"
  );
commander.parse(process.argv);

const config = {
  nettingInterval: commander.interval || serverConfig.nettingInterval,
  host: commander.host || serverConfig.host,
  port: commander.port || serverConfig.port,
  network: commander.network || serverConfig.network,
  address: serverConfig.address,
  password: serverConfig.password
};

let web3;
let utility;
let utilityAfterNetting;
let utilityContract;
web3 = web3Helper.initWeb3(config.network);

async function init() {
  shell.cd("zokrates-code");
  utilityContract.events.NettingSuccess(
    async (error, event) => {
      if (error) {
        console.error(error.msg);
      }
      console.log("Netting successful!")
    }
  );
}


async function runZokrates() {

  const utilityBeforeNetting = JSON.parse(JSON.stringify(utility));
  Object.setPrototypeOf(utilityBeforeNetting, Utility.prototype);
  utilityAfterNetting = { ...utility };
  Object.setPrototypeOf(utilityAfterNetting, Utility.prototype);
  utilityAfterNetting = utilityAfterNetting.settle();
  const hhWithEnergy = serverConfig.hhProduce;
  const hhNoEnergy = serverConfig.hhConsume
  let hhAddressToHash = zkHandler.generateProof(
    utilityBeforeNetting,
    utilityAfterNetting,
    hhWithEnergy,
    hhNoEnergy
  );
  delete hhAddressToHash[ZERO_ADDRESS];

  let rawdata = fs.readFileSync('../zokrates-code/proof.json');
  let data = JSON.parse(rawdata);
  if (Object.keys(hhAddressToHash).length > 0) {
    await web3.eth.personal.unlockAccount(
      config.address,
      config.password,
      null
    );
    web3.eth.defaultAccount = config.address;
    utilityContract.methods
      .checkNetting(
        Object.keys(hhAddressToHash),
        data.proof.a,
        data.proof.b,
        data.proof.c,
        data.inputs
      )
      .send({ from: web3.eth.defaultAccount, gas: 60000000 }, (error, txHash) => {
        if (error) {
          throw error;
        }
      })
      .on('receipt', receipt => {
        fs.appendFile('../tmp/res.csv', `,${receipt.gasUsed}\n`, 'utf8', (err) => {
          if (err) throw err;
        });
      })
      .catch(err => {
        console.log(err)
      })
  } else {
    console.log("No households to hash.");
    console.log(`Sleep for ${config.nettingInterval}ms ...`);
  }
}

const app = express();

app.use(express.json());
app.use(cors());

let hasInit = false;
function triggerInit(){
  if(!hasInit){
    hasInit = true;
    init();
  }
}

app.put("/setup-benchmark", async (req, res) => {
  try {
    let cadr = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../tmp/addresses.txt"), 'utf8', function (err, data) {
      if (err) {
        throw err;
      }
      return data;
    }));
    
    let cAddresses = cadr;

    let obj = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../build/contracts/dUtilityBenchmark.json"), (data, err) => {
      if(err) console.log(err);
      return data
    }));
    utilityContract = new web3.eth.Contract(
      obj.abi,
      cAddresses["contract"]
    );

    triggerInit();

    res.status(200);
    res.send();
  } catch (error) {
    console.error("PUT /setup-benchmark", error.message);
    res.status(500);
    res.send(error);
  }
});

function sleep(ms) {
  console.log("Sleeping 5 secs")
  return new Promise(resolve => {
    setTimeout(resolve, ms)
  })
}

app.put("/benchmark-energy", async (req, res) => {
  try {
    const {
      meterDeltas = [],
      hhAddresses = [],
      timestamp = Date.now()
    } = req.body;
    utility = new Utility();

    if (meterDeltas.length !== hhAddresses.length) {
      throw new Error("Meter deltas and addresses have to be the same length");
    }

    console.log("\nIncoming meter deltas:");
    console.log(meterDeltas);
    console.log("\nIncoming household addresses:");
    console.log(hhAddresses);

    hhAddresses.forEach(address => {
      utility.addHousehold(address);
    });

    meterDeltas.forEach((meterDelta, i) => {
      utility.updateMeterDelta(hhAddresses[i], meterDelta, timestamp);
    });

    await sleep(5000)

    runZokrates();


    console.log(
      `\nOff-chain utility updated for benchmark of ${hhAddresses.length} households`
    );

    // TODO: Invoke runZokrates?

    res.status(200);
    res.send();
  } catch (error) {
    console.log(error)
    console.error("PUT /benchmark-energy", error.message);
    throw error
    res.status(500);
    res.send(error);
  }
});





/**
 * Let the server listen to incoming requests on the given IP:Port
 */
app.listen(config.port, () => {
  console.log(`NED Server running at http://${config.host}:${config.port}/`);
});