const sha256 = require("js-sha256");
const commander = require("commander");
var path = require('path');
var fs = require("fs");
const web3Helper = require("../helpers/web3");
const web3 = web3Helper.initWeb3("benchmark");
const web3Utils = require("web3-utils");
const serverConfig = require("../household-server-config");
const request = require("request-promise");
const { address, password } = require("../household-server-config");

let contract;
let verifier;

let args = process.argv.slice(2);
let hhAddresses = [];
let meterDeltas = [];

const config = {
    nedUrl: commander.nedUrl || serverConfig.nedUrl,
    network: commander.network || serverConfig.network,
    address: commander.address || serverConfig.address,
    password: commander.password || serverConfig.password,
  };

let wE;
let nE;

if(args.length === 2 && args[0] >= 1 && args[1] >= 1){
    wE = Number(args[0]);
    nE = Number(args[1]);

    runBenchmark(wE, nE);

}

function runBenchmark(wE, nE){
    let n = wE + nE;
    genAddresses(n);
    setupBenchmark();
}

//This function returns a random number within a given range
function getRandomNumberFromRange(start, end) {
    var range = end - start;
    var result = Math.random() * range;
    result += start;
    return Math.round(result);
}

/*
# This function creates and returns an Array with Energy Deltas for wE# of 
# Energy Producing HHs and nE# of Energy Consuming HHs
*/
function genData() {
    let pDeltas = new Array(wE);
    let cDeltas = new Array(nE);
    for (let i = 0; i < wE; i++) {
        //c = getRandomNumberFromRange(1, 16) / 2.3; //Math.random() < 0.5 ? 0 : 1;
        p = getRandomNumberFromRange(0, 13) / 2.3; //Math.random() < 0.5 ? -1 : 0;
        pDeltas[i] = kWhToWs(Number(((p) / 100).toFixed(4))); //.toString();
    }

    for (let i = 0; i < nE; i++) {
        c = getRandomNumberFromRange(1, 16) / 2.3; //Math.random() < 0.5 ? 0 : 1;
        cDeltas[i] = kWhToWs(Number(((-Math.abs(c)) / 100).toFixed(4))); //.toString();
    }
    hhD = pDeltas.concat(cDeltas);
    return hhD;
}

/*
# This function returns an input area with hashed values
*/
function convertHHDeltas(hhDeltas) {
    let hashedHHD = new Array(hhDeltas.length);
    for (let i = 0; i < hhDeltas.length; i++) {
        //I'm not able to import the zokrates and conversion helpers here from the project. I believe this is the case because we define a new npm package. Will investigate once everything is runnning smoothly   
        const paddedMeterDeltaHex = web3Utils.padLeft(web3Utils.numberToHex(Math.abs(hhDeltas[i])), 128)
        const paddedMeterDeltaBytes = web3Utils.hexToBytes(paddedMeterDeltaHex);
        const hash = `0x${sha256(paddedMeterDeltaBytes)}`;
        hashedHHD[i] = hash.toString();
        console.log("Hash: ", hashedHHD[i]);
    }
    return hashedHHD;
} 

function genAddresses(n){
    for(i = 0; i < n; i++){
        hhAddresses.push('0x' + sha256(i.toString()).substring(0, 40));
    }
    console.log("adds: ", hhAddresses)
}

function kWhToWs(kWh) {
    const kWhToWs = 3600000;
    let ws = kWh * kWhToWs;
    return (Math.round(ws)).toString();
}

function getContractAddresses(arg){
    // let res;
    let res = fs.readFileSync('../tmp/addresses.txt', 'utf8', function (err, data) {
        if (err){
            throw err;
        }
        if(arg != undefined){
            return JSON.parse(data)[arg]
        }
        return JSON.parse(data)
    });
    return res;
}

function getContracts(){
    let addresses = getContractAddresses()
    contract = new web3.eth.Contract(
        require("../build/contracts/dUtilityBenchmark.json").abi,
        addresses["contract"]
    );

    verifier = new web3.eth.Contract(
        require("../build/contracts/verifier.json").abi,
        addresses["verifier"]
    );
}

function setupBenchmark(){
    (async () => {
        // getContracts()
        // meterDeltas = genData();
        // let accounts = web3.eth.getAccount

        // const timestamp = Date.now();
        // sendMeterDeltasToNed(config.nedUrl, {
        //     meterDeltas,
        //     hhAddresses,
        //     timestamp
        //     } //,contract.options.address
        // );

        // console.log("Hashed Array of meterDeltas: ", convertHHDeltas(meterDeltas));
        // console.log("HERE: ", typeof(getContractAddresses("verifier")))
        console.log(getContractAddresses("verifier"))
        
        // await web3.eth.personal.unlockAccount("0x00bd138abd70e2f00903268f3db08f2d25677c9e", 'node0', null);
        // web3.eth.defaultAccount = '0x00bd138abd70e2f00903268f3db08f2d25677c9e';
        // contract.methods.setupBenchmark(getContractAddresses("verifier"), hhAddresses, meterDeltas).send({
        //     from: web3.eth.defaultAccount,
        //     gas: 6000000
        // })
        // .on('receipt', (tx) => {
        //     console.log("tx done")
        //     if (tx.status == true) {
        //         console.log(tx)
        //     } else {
        //         console.error(tx)
        //     }
        // })
        // .catch(err => {
        //     console.log(err);
        // })

        

        // let contract = new web3.eth.Contract(abi)
        //     .deploy({
        //         data: bytecode 
        //     })
        //     .send({
        //         from: accounts[0],
        //         gas: '3000000'
        //     })
        //     .on('receipt', (tx) => {
        //         if (tx.status == true) {
        //             console.log("Contract Deployed! Gas used: " + tx.gasUsed)
        //         } else {
        //             console.error(tx)
        //         }
        //     })
        //     .then(newContractInstance => {
        //         console.log("Sending data to the NED...")

        //         contract = newContractInstance;

        //         setBenchmarkContractAddress(config.nedUrl, contract.options.address)
        //         jsonInterface = require("../build/contracts/Verifier.json");
        //         abi = jsonInterface.abi
        //         bytecode = jsonInterface.bytecode
        //         new web3.eth.Contract(abi)
        //             .deploy({
        //                 data: bytecode
        //             })
        //             .send({
        //                 from: accounts[0],
        //                 gas: '3000000'
        //             })
        //             .then(veriCon => {
        //                 makeTransaction(veriCon.options.address, hhAddresses, convertHHDeltas(meterDeltas));
        //             })
        //     })
        //     .catch(err => {
        //         console.log(err);
        //         process.exit(1);
        //     })
        
        function makeTransaction(acc, addresses, meterDeltas) {
            // contract.methods.setupBenchmark(acc, addresses, meterDeltas).send({
            //     from: accounts[0],
            //     gas: 6000000
            // })
            // .on('receipt', (tx) => {
            //     console.log("tx done")
            //     if (tx.status == true) {
            //         console.log(tx)
            //     } else {
            //         console.error(tx)
            //     }
            // })
            // .catch(err => {
            //     console.log(err);
            // })
        }

        
        function setBenchmarkContractAddress(ned_url, address){
            return request(`${ned_url}/setup-benchmark`,{
                method: "PUT",
                json: {address: address}
            });
        }

        function sendMeterDeltasToNed(ned_url, payload){
            return request(`${ned_url}/benchmark-energy`, {
                method: "PUT",
                json: payload
            });
        }

    })();
}