const sha256 = require("js-sha256");
const commander = require("commander");
var fs = require("fs");
const web3Helper = require("../helpers/web3");
const zokratesHelper = require("../helpers/zokrates");
const web3 = web3Helper.initWeb3("benchmark");
const web3Utils = require("web3-utils");
const serverConfig = require("../household-server-config");
const request = require("request-promise");
const { address, password } = require("../household-server-config");

let args = process.argv.slice(2);

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
    setupBenchmark();
}

function setupBenchmark() {
    (async () => {
        console.log("Setting up benchmark...")
        let hhAddresses = genAddresses(wE + nE);
        let dUtility = getdUtilityContract()
        let meterDeltas = genData();

        setBenchmarkContractAddress(config.nedUrl, "")
        let timestamp = Date.now();
        sendMeterDeltasToNed(config.nedUrl, {
            meterDeltas,
            hhAddresses,
            timestamp
        });

        await web3.eth.personal.unlockAccount(address, password, null);
        web3.eth.defaultAccount = address;

        dUtility.methods.setupBenchmark(getContractAddresses().verifier, hhAddresses, convertHHDeltas(meterDeltas)).send({
            from: web3.eth.defaultAccount,
            gas: 60000000
        })
            .on('receipt', (tx) => {
                if (tx.status == true) {
                    console.log("Setup Successful!")
                    process.exit()
                }
            })
            .catch(err => {
                console.log(err);
            })

        function setBenchmarkContractAddress(ned_url, payload) {
            return request(`${ned_url}/setup-benchmark`, {
                method: "PUT",
                json: payload
            });
        }

        function sendMeterDeltasToNed(ned_url, payload) {
            return request(`${ned_url}/benchmark-energy`, {
                method: "PUT",
                json: payload
            });
        }
    })();
}

//creates mock public ethereum keys which will represent a household address for benchmarking
function genAddresses(n) {
    let hhAddresses = [];
    for (i = 0; i < n; i++) {
        hhAddresses.push('0x' + sha256(i.toString()).substring(0, 40));
    }
    return hhAddresses;
}

//returns object of deployed dUtilityBenchmark contract
function getdUtilityContract() {
    let addresses = getContractAddresses()
    return new web3.eth.Contract(
        require("../build/contracts/dUtilityBenchmark.json").abi,
        addresses["contract"]
    );
}

/*
# This function creates and returns an Array with Energy Deltas for wE# of 
# Energy Producing HHs and nE# of Energy Consuming HHs
*/
function genData() {
    let pDeltas = new Array(wE);
    let cDeltas = new Array(nE);
    for (let i = 0; i < wE; i++) {
        p = getRandomNumberFromRange(0, 13) / 2.3;
        pDeltas[i] = kWhToWs(Number(((p) / 100).toFixed(4)));
    }

    for (let i = 0; i < nE; i++) {
        c = getRandomNumberFromRange(1, 16) / 2.3;
        cDeltas[i] = kWhToWs(Number(((-Math.abs(c)) / 100).toFixed(4)));
    }
    hhD = pDeltas.concat(cDeltas);
    return hhD;
}

//This function returns a random number within a given range
function getRandomNumberFromRange(start, end) {
    var range = end - start;
    var result = Math.random() * range;
    result += start;
    return Math.round(result);
}

/*
# returns an input area with hashed values
*/
function convertHHDeltas(hhDeltas) {
    let hashedHHD = new Array(hhDeltas.length);
    for (let i = 0; i < hhDeltas.length; i++) {
        hashedHHD[i] = zokratesHelper.packAndHash(hhDeltas[i]).toString();
        // const paddedMeterDeltaHex = zokratesHelper.padPackParams256(Math.abs(hhDeltas[i]))
        // const paddedMeterDeltaBytes = web3Utils.hexToBytes(paddedMeterDeltaHex);
        // const hash = `0x${sha256(paddedMeterDeltaBytes)}`;
        // hashedHHD[i] = hash.toString();
    }
    return hashedHHD;
} 

function kWhToWs(kWh) {
    const kWhToWs = 3600000;
    let ws = kWh * kWhToWs;
    return (Math.round(ws)).toString();
}

//parses verifier and dUtilituBenchmark address from local file
function getContractAddresses(){
    return JSON.parse(fs.readFileSync('tmp/addresses.txt', 'utf8', function (err, data) {
        if (err){
            throw err;
        }
       return data
    }));
}