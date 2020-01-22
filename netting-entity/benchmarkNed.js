const express = require("express");
const cors = require("cors");
const commander = require("commander");
const shell = require("shelljs");
const fs = require('fs');
const Utility = require("./utility");
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
    (error, event) => {
      if (error) {
        console.error(error.msg);
        throw error;
      }
      console.log("NettingSuccess event", event);
    }
  );
}

async function runZokrates() {
  const utilityBeforeNetting = JSON.parse(JSON.stringify(utility));
  Object.setPrototypeOf(utilityBeforeNetting, Utility.prototype);
  utilityAfterNetting = { ...utility };
  Object.setPrototypeOf(utilityAfterNetting, Utility.prototype);
  utilityAfterNetting.settle();
  let hhAddressToHash = zkHandler.generateProof(
    utilityBeforeNetting,
    utilityAfterNetting,
    "benchmark_mode"
  );
  delete hhAddressToHash[ZERO_ADDRESS];

  let rawdata = fs.readFileSync('../zokrates-code/proof.json');
  let data = JSON.parse(rawdata);
  if (Object.keys(hhAddressToHash).length > 0) {
    //sometimes causes unlocking error when importing password and address via config file. No idea why
    await web3.eth.personal.unlockAccount(
      "0x00bd138abd70e2f00903268f3db08f2d25677c9e",
      "node0",
      null
    );
    utilityContract.methods
      .checkNetting(
        Object.keys(hhAddressToHash),
        data.proof.a,
        data.proof.b,
        data.proof.c,
        data.inputs
      )
      .send({ from: config.address, gas: 60000000 }, (error, txHash) => {
        if (error) {
          throw error;
        }
      })
      .on('receipt', receipt => {
        if(receipt.status){
          fs.appendFile('../tmp/res.csv', `,${receipt.gasUsed}\n`, 'utf8', (err) => {
            if (err) throw err;
          })
        } else {
          console.log("Netting failed...", receipt)
        }
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

    res.status(200);
    res.send();
  } catch (error) {
    console.log(error)
    console.error("PUT /benchmark-energy", error.message);
    throw error
  }
});

/**
 * Let the server listen to incoming requests on the given IP:Port
 */
app.listen(config.port, () => {
  console.log(`NED Server running at http://${config.host}:${config.port}/`);
});