const shell = require("shelljs")
const keyth = require('keythereum')
const fs = require('fs')

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function getEnodes(){
  let new_string = "";
  shell.exec("docker-compose -f parity-authority/parity_test.yml up --build -d");
  await sleep(30000);
  let enodes_str = shell.exec("docker-compose -f parity-authority/parity_test.yml logs | grep enode | awk {'print $9'}");
  shell.exec("docker-compose -f parity-authority/parity_test.yml down -v");
  //console.log("ENODES: ", enodes_strn.toString());
  
  let enodes_arr = enodes_str.trim().split("\n")
  
  for(let i = 0; i < enodes_arr.length; i++){
    if((i+1) == enodes_arr.length){
      new_string += `"` + enodes_arr[i] + `"`;
    }
    else{
      new_string += `"` + enodes_arr[i] + `"` + ",\n";
    }
  }

  let toml_string = `[parity]
chain = "parity/config/chain.json"

[rpc]
interface = "0.0.0.0"
cors = ["all"]
hosts = ["all"]
apis = ["web3", "eth", "net", "parity", "traces", "rpc", "personal", "parity_accounts", "signer", "parity_set"]
port = 8545

[network]
bootnodes = [
${new_string}
]

[account]
password = ["parity/authority.pwd"]

[mining]
reseal_on_txs = "none"
reseal_min_period = 1000
reseal_max_period = 5000
tx_queue_size = 16384
tx_queue_mem_limit = 4096
tx_queue_per_sender = 16384

[websockets]
disable = false
port = 8546
apis = ["pubsub","parity_pubsub","shh", "shh_pubsub", "web3", "eth", "net", "parity", "traces", "rpc", "personal", "parity_accounts", "signer", "parity_set"]
interface = "0.0.0.0"
hosts = ["all"]`

  fs.writeFile(`./parity-authority/parity/config/authority.toml`, toml_string, 'utf8',(err) => {   
    if (err) throw err;
  })

}

function generatePrivateKeyFile(hhNo){
    
    var keyobj = JSON.parse(fs.readFileSync(`./parity-authority/parity/authorities/authority${hhNo}.json`, 'utf8'));
    
    var privateKey = keyth.recover(`node${hhNo}`,keyobj) 
    
    //console.log("This is the private key:", privateKey.toString('hex'));

    fs.writeFile(`./parity-authority/parity/node${hhNo}.network.key`, (privateKey.toString('hex')), 'utf8',(err) => {   
        if (err) throw err;
      })
}

function generatePasswordFile(hhNo){
    fs.writeFile(`./parity-authority/parity/authorities/authority${hhNo}.pwd`, `node${hhNo}`, 'utf8',(err) => {   
        if (err) throw err;
      }) 
}

function generateMonitoringAppFile(hhNo){
    let new_string = "";

    for(let i = 3; i <= hhNo; i++){
        new_string += `,
  {
    "name"              : "authority${i}",
    "script"            : "app.js",
    "log_date_format"   : "YYYY-MM-DD HH:mm Z",
    "merge_logs"        : false,
    "watch"             : true,
    "max_restarts"      : 10,
    "exec_interpreter"  : "node",
    "exec_mode"         : "fork_mode",
    "env":
    {
      "NODE_ENV"        : "production",
      "RPC_HOST"        : "authority${i}",
      "RPC_PORT"        : "8545",
      "LISTENING_PORT"  : "30303",
      "INSTANCE_NAME"   : "authority${i}",
      "WS_SERVER"       : "ws://dashboard:3000",
      "WS_SECRET"       : "123",
      "VERBOSITY"       : 3
    }
  }`
    }

    let standard_string = `
[
  {
    "name"              : "authority0",
    "script"            : "app.js",
    "log_date_format"   : "YYYY-MM-DD HH:mm Z",
    "merge_logs"        : false,
    "watch"             : true,
    "max_restarts"      : 10,
    "exec_interpreter"  : "node",
    "exec_mode"         : "fork_mode",
    "env":
    {
      "NODE_ENV"        : "production",
      "RPC_HOST"        : "authority0",
      "RPC_PORT"        : "8545",
      "LISTENING_PORT"  : "30303",
      "INSTANCE_NAME"   : "authority0",
      "WS_SERVER"       : "ws://dashboard:3000",
      "WS_SECRET"       : "123",
      "VERBOSITY"       : 3
    }
  },
  {
    "name"              : "authority1",
    "script"            : "app.js",
    "log_date_format"   : "YYYY-MM-DD HH:mm Z",
    "merge_logs"        : false,
    "watch"             : true,
    "max_restarts"      : 10,
    "exec_interpreter"  : "node",
    "exec_mode"         : "fork_mode",
    "env":
    {
      "NODE_ENV"        : "production",
      "RPC_HOST"        : "authority1",
      "RPC_PORT"        : "8545",
      "LISTENING_PORT"  : "30303",
      "INSTANCE_NAME"   : "authority1",
      "WS_SERVER"       : "ws://dashboard:3000",
      "WS_SECRET"       : "123",
      "VERBOSITY"       : 3
    }
  },
  {
    "name"              : "authority2",
    "script"            : "app.js",
    "log_date_format"   : "YYYY-MM-DD HH:mm Z",
    "merge_logs"        : false,
    "watch"             : true,
    "max_restarts"      : 10,
    "exec_interpreter"  : "node",
    "exec_mode"         : "fork_mode",
    "env":
    {
      "NODE_ENV"        : "production",
      "RPC_HOST"        : "authority2",
      "RPC_PORT"        : "8545",
      "LISTENING_PORT"  : "30303",
      "INSTANCE_NAME"   : "authority2",
      "WS_SERVER"       : "ws://dashboard:3000",
      "WS_SECRET"       : "123",
      "VERBOSITY"       : 3
    }
  }${new_string}
]`

fs.writeFile('./parity-authority/monitor/app.json', standard_string, 'utf8',(err) => {   
    if (err) throw err;
  })

}

function generateHelperConstants(hhNo){

  let new_str = "";

  for(let i = 3; i <= hhNo; i++){

    let key_json = JSON.parse(fs.readFileSync(`./parity-authority/parity/authorities/authority${i}.json`, 'utf8'));
    
    let address = "0x" + key_json.address;

    new_str += `,
    "${address}"`
    
  }

  let standard_str = `
module.exports = {
  UTILITY_ADDRESS: "0x0000000000000000000000000000000000000042",
  OWNED_SET_ADDRESS: "0x0000000000000000000000000000000000000044",
  VERIFIER_ADDRESS: "0x0000000000000000000000000000000000000045",
  AUTHORITY_ADDRESS: "0x00bd138abd70e2f00903268f3db08f2d25677c9e",
  TESTS_FAKE_ADDRESS: "0xFbc22a13295Dea4EfBb061ff162CD19B362d1F1D",
  OTHER_AUTHORITY_ADDRESSES: [
    "00aa39d30f0d20ff03a22ccfc30b7efbfca597c2",
    "002e28950558fbede1a9675cb113f0bd20912019"${new_str}
  ],
  ZERO_ADDRESS: "0x0000000000000000000000000000000000000000"
};`
  fs.writeFile('./helpers/constants.js', standard_str, 'utf8',(err) => {   
    if (err) throw err;
  })

}

function generateYML(hhNo){
    let new_str = "";

    for(let i = 3; i <= hhNo; i++){

        let key_json = JSON.parse(fs.readFileSync(`./parity-authority/parity/authorities/authority${i}.json`, 'utf8'));
        
        let address = "0x" + key_json.address;

        new_str += `

  authority${i}:
    build:
      context: .
      dockerfile: docker_authority/Dockerfile
      args:
        PARITY_VERSION: \${PARITY_VERSION}
        NETWORK_NAME: \${NETWORK_NAME}
        ID: ${i}
    command:
      --config parity/config/authority.toml
      --engine-signer ${address}
      --no-persistent-txqueue
      --fast-unlock
    ports:
      - ${8545 + i*10}:8545
      - ${8546 + i*10}:8546
    networks:
      app_net:
        ipv4_address: 172.16.0.${10 + i}
`
    }

    let standard_str = `
version: '2.1'
services:
  authority0:
    build:
      context: .
      dockerfile: docker_authority/Dockerfile
      args:
        PARITY_VERSION: \${PARITY_VERSION}
        NETWORK_NAME: \${NETWORK_NAME}
        ID: 0
    volumes:
      - data-volume:/home/parity/.local/share/io.parity.ethereum/chains/\${NETWORK_NAME}/db
    command:
      --config parity/config/authority.toml
      --engine-signer 0x00bd138abd70e2f00903268f3db08f2d25677c9e
      --ws-interface 0.0.0.0
      --unsafe-expose
      --jsonrpc-cors all
      --no-persistent-txqueue
      --fast-unlock
      --tracing on
    ports:
      - 8545:8545
      - 8546:8546
      - 8180:8180
      - 30303:30303
    networks:
      app_net:
        ipv4_address: 172.16.0.10


  authority1:
    build:
      context: .
      dockerfile: docker_authority/Dockerfile
      args:
        PARITY_VERSION: \${PARITY_VERSION}
        NETWORK_NAME: \${NETWORK_NAME}
        ID: 1
    command:
      --config parity/config/authority.toml
      --engine-signer 0x00aa39d30f0d20ff03a22ccfc30b7efbfca597c2
      --ws-interface 0.0.0.0
      --unsafe-expose
      --jsonrpc-cors all
      --no-persistent-txqueue
      --fast-unlock
    ports:
      - 8555:8545
      - 8556:8546
    networks:
      app_net:
        ipv4_address: 172.16.0.11


  authority2:
    build:
      context: .
      dockerfile: docker_authority/Dockerfile
      args:
        PARITY_VERSION: \${PARITY_VERSION}
        NETWORK_NAME: \${NETWORK_NAME}
        ID: 2
    command:
      --config parity/config/authority.toml
      --engine-signer 0x002e28950558fbede1a9675cb113f0bd20912019
      --no-persistent-txqueue
      --fast-unlock
    ports:
      - 8565:8545
      - 8566:8546
    networks:
      app_net:
        ipv4_address: 172.16.0.12
${new_str}

  monitor:
    image: buythewhale/ethstats_monitor
    volumes:
      - ./monitor/app.json:/home/ethnetintel/eth-net-intelligence-api/app.json:ro
    networks:
      app_net:
        ipv4_address: 172.16.0.100


  dashboard:
    image: buythewhale/ethstats
    volumes:
      - ./dashboard/ws_secret.json:/eth-netstats/ws_secret.json:ro
    ports:
      - 3001:3000
    networks:
      app_net:
        ipv4_address: 172.16.0.200

volumes:
  data-volume:
networks:
  app_net:
    driver: bridge
    ipam:
      driver: default
      config:
      - subnet: 172.16.0.1/24
        gateway: 172.16.0.1
`
    return standard_str
}

let args = process.argv.slice(2);

let parity_yml;



let hh;

if((args.length === 1) && args[0] >= 3){
    
  hh = Number(args[0]);

  for(let i = 3; i <= hh; i++){
      generatePrivateKeyFile(i);
      generatePasswordFile(i);
  }
  
  generateMonitoringAppFile(hh);

  generateHelperConstants(hh);

  
  parity_yml = generateYML(hh);

  fs.writeFile('parity-authority/parity_test.yml', parity_yml, 'utf8',(err) => {   
    if(err){
      throw err;
    }
    else{
      getEnodes();
    }
  })
  console.log("DONE!");

}else{
    console.log("ERROR! The number of inputs provided is not correct OR the input is not a number OR not a numbers >= 3! \nThe Setup-Script stopped! \nPlease provide for the numbers of HHs an integer value >= 3! \nIF YOU ONLY WANT A CHAIN WITH 2 NODES, THE STANDARD CONFIGURATION IS SUFFICIENT!");
}