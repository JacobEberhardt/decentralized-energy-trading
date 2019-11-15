const sha256 = require("js-sha256");
var fs = require("fs");
let Web3 = require('web3');
const solc = require('solc');
const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
const contractPath = "../contracts/dUtilityBenchmark.sol";

let args = process.argv.slice(2);
let code = [];
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
    // genData(wE, nE);
    genAddresses(n);
    setupBenchmark();
}


function genData(wE, nE){

}

function genAddresses(n){
    for(i = 0; i < n; i++){
        code.push('0x' + sha256(i.toString()).substring(0, 40));
    }
    console.log("adds: ", code)
}

function setupBenchmark(){
    (async () => {

        // /Users/paul/Documents/projects/decentralized-energy-trading/parity-authority/parity/node0.network.key
        // let account = await web3.eth.accounts.privateKeyToAccount('0x' + fs.readFileSync("parity-authority/parity/node0.network.key").toString().replace(/(\r\n|\n|\r)/gm, ""));
        let account = await web3.eth.personal.unlockAccount("0x00bd138abd70e2f00903268f3db08f2d25677c9e", 'node0', null);
        console.log(account)
        let jsonInterface = require("/build/dUtilityBenchmark.json");
        let abi = jsonInterface.abi
        let bytecode = jsonInterface.bytecode
        console.log(abi)
        console.log(bytecode)

        let contract = new web3.eth.Contract(abi)
            .deploy({
                data: '0x' + bytecode.object 
            })
            .send({
                from: accounts[0],
                gas: '2000000'
            })
            .on('receipt', (tx) => {
                if (tx.status == true) {
                    console.log("Contract Deployed! Gas used: " + tx.gasUsed)
                }
            })
            .then(newContractInstance => {
                contract = newContractInstance;
                // makeTransaction(account, code, [0] * (wE + nE));
            })
            .catch(err => {
                console.log(err);
                process.exit(1);
            })

        function makeTransaction(account, addresses, meterDeltas) {
            contract.methods.setupBenchmark(addresses, meterDeltas).send({
                from: account,
                gas: 6000000
            })
        }
    })();
}