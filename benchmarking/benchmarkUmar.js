const express = require("express");
const sha256 = require("js-sha256");
const cors = require("cors");
const commander = require("commander");

const web3Helper = require("../helpers/web3");
const web3Utils = require("web3-utils");
const zokratesHelper = require("../helpers/zokrates");
const conversionHelper = require("../helpers/conversion");
const ned = require("../household-server/apis/ned");

const serverConfig = require("../household-server-config");
//const contractHelper = require("../helpers/contract");

const app = express();

app.use(express.json());
app.use(cors());

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
    utilityDataCollection: serverConfig.utilityDataCollection
};

let web3;

let args = process.argv.slice(2);
  
let code;
let code2;
let wE;
let nE;

if(args.length === 2 && args[0] >= 1 && args[1] >= 1){
    wE = Number(args[0]);
    nE = Number(args[1]);

    runBenchmark(wE, nE);

}

function runBenchmark(wE, nE){
    let n = wE + nE;
    genData(wE, nE);
}


function getRandomNumberFromRange(start, end){
	var range = end - start;
	var result = Math.random() * range;
	result += start;
	return Math.round(result);
}

function genData(wE, nE){
    let pDeltas = new Array(wE);
    let cDeltas = new Array(nE);

    for(let i = 0; i < wE; i++){
        c = getRandomNumberFromRange(1,14)/2.3; //Math.random() < 0.5 ? 0 : 1;
        p = getRandomNumberFromRange(0, 28)/2.3; //Math.random() < 0.5 ? -1 : 0;
        pDeltas[i] = (((p + c)/100).toFixed(4)).toString();
    }

    for(let i = 0; i < nE; i++){
        c = getRandomNumberFromRange(1,14)/2.3; //Math.random() < 0.5 ? 0 : 1;
        cDeltas[i] = (((-Math.abs(c))/100).toFixed(4)).toString();
    }

    let hhDeltas = pDeltas.concat(cDeltas);

    for(let i = 0; i < (wE+nE); i++){
        console.log("hhDeltas: ", hhDeltas[i]);

    }

    convertHHDeltas(hhDeltas);

    function convertHHDeltas(hhDeltas){
        console.log("Now Converting hhDeltas");

        let hashedHHDeltas = new Array(hhDeltas.length);

        for(let i = 0; i < hhDeltas.length; i++){

            //console.log("Conversion Result ", i+1, ") ", conversionHelper.kWhToWs(Math.abs(hhDeltas[i])));

            //console.log("to_kWh :", conversionHelper.wsToKWh(conversionHelper.kWhToWs(Math.abs(hhDeltas[i]))));

            const paddedMeterDeltaHex = zokratesHelper.padPackParams256(
                conversionHelper.kWhToWs(Math.abs((hhDeltas[i])))
            );
            
            const paddedMeterDeltaBytes = web3Utils.hexToBytes(paddedMeterDeltaHex);
            const hash = `0x${sha256(paddedMeterDeltaBytes)}`;

            hashedHHDeltas[i] = hash;
    
        }

        for(let i = 0; i < hashedHHDeltas.length; i++){
            console.log("hashedDeltas: ", hashedHHDeltas[i]);
    
        }

    }
    /*
    sendHHDeltasToNed: async (config, web3, meterDelta, hash) => {
        const paddedMeterDeltaHex = zokratesHelper.padPackParams256(
            conversionHelper.kWhToWs(Math.abs(meterDelta))
        );
        
        const paddedMeterDeltaBytes = web3Utils.hexToBytes(paddedMeterDeltaHex);
        const hash = `0x${sha256(paddedMeterDeltaBytes)}`;
    
        const { signature } = await web3Helper.signData(
          web3,
          address,
          password,
          hash
        );
    
        return ned.putSignedMeterReading(config.nedUrl, address, {
          signature,
          hash,
          meterDelta
        });
      }
      */

}

