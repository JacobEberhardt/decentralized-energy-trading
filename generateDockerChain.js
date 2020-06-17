const shell = require("shelljs")
const keyth = require('keythereum')
const fs = require('fs')

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * This function retrieves the enodes of the addtionally created accounts, by launching the chain and 
 * copying the enode addresses from the logs
 * The array of all enodes is then included into the authority.toml file and saced in the parity-authority/parity/config directory
 */
async function getEnodes(){
  let new_string = "";
  shell.exec("docker-compose -f parity-authority/parity.yml up --build -d");
  await sleep(25000);
  let enodes_str = shell.exec("docker-compose -f parity-authority/parity.yml logs | grep enode | awk {'print $9'}");
  shell.exec("docker-compose -f parity-authority/parity.yml down -v");
  //console.log("ENODES: ", enodes_strn.toString());
  let base_enodes = ["enode://147573f46fe9f5cc38fbe070089a31390baec5dd2827c8f2ef168833e4d0254fbee3969a02c5b9910ea5d5b23d86a6ed5eabcda17cc12007b7d9178b6c697aa5@172.16.0.10:30303",
  "enode://1412ee9b9e23700e4a67a8fe3d8d02e10376b6e1cb748eaaf8aa60d4652b27872a8e1ad65bb31046438a5d3c1b71b00ec3ce0b4b42ac71464b28026a3d0b53af@172.16.0.11:30303",
  "enode://9076c143a487aa163437a86f7d009f257f405c50bb2316800b9c9cc40e5a38fef5b414a47636ec38fdabc8a1872b563effa8574a7f8f85dc6bde465c368f1bf5@172.16.0.12:30303"]

  let enodes_arr = enodes_str.trim().split("\n")
  
  if(enodes_arr.length > 3){
    new_string += ",\n"
    for(let i = 0; i < enodes_arr.length; i++){
      if((enodes_arr[i] != base_enodes[0]) && (enodes_arr[i] != base_enodes[1]) && (enodes_arr[i] != base_enodes[2])){
        if((i+1) == enodes_arr.length){
          new_string += `  "` + enodes_arr[i] + `"`;
        }
        else{
          new_string += `  "` + enodes_arr[i] + `"` + ",\n";
        }
      }
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
  "enode://147573f46fe9f5cc38fbe070089a31390baec5dd2827c8f2ef168833e4d0254fbee3969a02c5b9910ea5d5b23d86a6ed5eabcda17cc12007b7d9178b6c697aa5@172.16.0.10:30303",
  "enode://1412ee9b9e23700e4a67a8fe3d8d02e10376b6e1cb748eaaf8aa60d4652b27872a8e1ad65bb31046438a5d3c1b71b00ec3ce0b4b42ac71464b28026a3d0b53af@172.16.0.11:30303",
  "enode://9076c143a487aa163437a86f7d009f257f405c50bb2316800b9c9cc40e5a38fef5b414a47636ec38fdabc8a1872b563effa8574a7f8f85dc6bde465c368f1bf5@172.16.0.12:30303"${new_string}
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

/**
 * Generates a Private Key file which includes the Private Key for an account/HH
 * The "keyethereum" package is used to calculate the private key based on the key file
 * Input Parameter: Household Number
 */

function generatePrivateKeyFile(hhNo){
    
    var keyobj = JSON.parse(fs.readFileSync(`./parity-authority/parity/authorities/authority${hhNo}.json`, 'utf8'));
    
    var privateKey = keyth.recover(`node${hhNo}`,keyobj) 
    
    //console.log("This is the private key:", privateKey.toString('hex'));

    fs.writeFile(`./parity-authority/parity/node${hhNo}.network.key`, (privateKey.toString('hex')), 'utf8',(err) => {   
        if (err) throw err;
      })
}

/**
 * Generates a Password file which includes the password for an ETH account in the following form:
 * node[Household Number]
 * Input Parameter: Household Number
 */

function generatePasswordFile(hhNo){
    fs.writeFile(`./parity-authority/parity/authorities/authority${hhNo}.pwd`, `node${hhNo}`, 'utf8',(err) => {   
        if (err) throw err;
      }) 
}

/**
 * DEPRECATED: The current parity versions do not support this type of monitoring UI
 * 
 * Input Parameter: No. of Households
 */
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

/**
 * This function creates the helpers/constants.js file and adds the addresses of the newly created nodes to the
 * authority addresses array
 * Input Parameter: No. of Households
 */

function generateHelperConstants(hhNo){

  let new_str = "";

  for(let i = 3; i <= hhNo; i++){

    let key_json = JSON.parse(fs.readFileSync(`./parity-authority/parity/authorities/authority${i}.json`, 'utf8'));
    
    let address = key_json.address;

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

/**
 * This function creates the parity.yml and includes the newly created parity nodes
 * Input Parameter: No of Households 
 */

function generateYML(hhNo){
    let new_str = "";

    for(let i = 3; i <= hhNo; i++){

        let key_json = JSON.parse(fs.readFileSync(`./parity-authority/parity/authorities/authority${i}.json`, 'utf8'));
        
        let address = "0x" + key_json.address;

        new_str += `

  parity-authority-${i}:
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
    restart: unless-stopped
    ports:
      - ${8545 + i*10}:8545
      - ${8546 + i*10}:8546
    networks:
      parity_net:
        ipv4_address: 172.16.0.${10 + i}
`
    }

    let standard_str = `
version: '3.5'
services:
  parity-authority-0:
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
    restart: unless-stopped
    networks:
      parity_net:
        ipv4_address: 172.16.0.10


  parity-authority-1:
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
    restart: unless-stopped
    networks:
      parity_net:
        ipv4_address: 172.16.0.11


  parity-authority-2:
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
    restart: unless-stopped
    networks:
      parity_net:
        ipv4_address: 172.16.0.12
${new_str}

  monitor:
    image: buythewhale/ethstats_monitor
    volumes:
      - ./monitor/app.json:/home/ethnetintel/eth-net-intelligence-api/app.json:ro
    restart: unless-stopped
    networks:
      parity_net:
        ipv4_address: 172.16.0.100


  dashboard:
    image: buythewhale/ethstats
    volumes:
      - ./dashboard/ws_secret.json:/eth-netstats/ws_secret.json:ro
    ports:
      - 3001:3001
    restart: unless-stopped
    networks:
      parity_net:
        ipv4_address: 172.16.0.200

volumes:
  data-volume:
networks:
  parity_net:
    name: dockerized_network
    driver: bridge
    ipam:
      driver: default
      config:
      - subnet: 172.16.0.1/24`
    return standard_str
}

/**
 * This function creates the truffle-config.js with the authority addresses
 * Input Parameter: No. of HHs
 */
function generateTruffleConfig(hhNo){

  let new_str = "";

  for(let i = 3; i <= hhNo; i++){
    new_str += `
    authority_${i}: {
      host: "parity-authority-${i}",
      port: 8546,
      network_id: "8995",
      websockets: true
    },`
  }

  let standard_str = `
module.exports = {
  networks: {
    ganache: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "1234"
    },
    authority: {
      host: "parity-authority-0",
      port: 8546,
      network_id: "8995",
      websockets: true
    },
    authority_1: {
      host: "parity-authority-1",
      port: 8546,
      network_id: "8995",
      websockets: true
    },
    authority_2: {
      host: "parity-authority-2",
      port: 8546,
      network_id: "8995",
      websockets: true
    },${new_str}
    authority_docker: {
      host: "parity-authority-0",
      port: 8046,
      network_id: "8995",
      websockets: true
    },
    benchmark: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*"
    }
  },
  compilers: {
    solc: {
      version: "0.5.2",
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  }
};`;

  fs.writeFile('household-server/docker/decentralized-energy-trading/truffle-config.js', standard_str, 'utf8',(err) => {   
    if (err) throw err;
  })

  fs.writeFile('netting-entity/dockerized_setup/docker/decentralized-energy-trading/truffle-config.js', standard_str, 'utf8',(err) => {   
    if (err) throw err;
  })

}

/**
 * The script is called with exactly 1 input argument => Number of HHs
 */

let args = process.argv.slice(2);

let parity_yml;

let hh;

if((args.length === 1) && args[0] >= 2){
    
  hh = Number(args[0]);

  /**
   * Depending on the no. of HHs, private key files and password files for the previously created ETH accounts are created
   * Since 3 (authority0, 1, 2) ETH accounts with the corresponding Private Key and Password Files are implemented already 
   * in the initial project Repo, the counter for the loop starts with the files for the 4th (authority3) authority node
   */

  for(let i = 3; i <= hh; i++){
      generatePrivateKeyFile(i);
      generatePasswordFile(i);
  }
  
  /**
   * Creating the subdirectories for the Dockerized Setup, which will be referenced in the Dockerfiles
   */

  fs.mkdir('mock-sensor/docker/decentralized-energy-trading/mock-sensor', { recursive: true }, (err) => {
    if (err) throw err;
  });
  fs.mkdir('household-server/docker/decentralized-energy-trading/household-server', { recursive: true }, (err) => {
    if (err) throw err;
  });

  fs.mkdir('netting-entity/dockerized_setup/docker/decentralized-energy-trading/netting-entity', { recursive: true }, (err) => {
    generateTruffleConfig(hh);
    if (err) throw err;
  });

  /**
   * Calling the function to initialize the Application File for the Monitoring UI (deprecated)
   */
  
  generateMonitoringAppFile(hh);

  /**
   * Calling the Function to include the newly created HH addresses to helpers/constants.js
   */

  generateHelperConstants(hh);

  /**
   * Calling the Function to Generate the parity.yml file
   * The file is then written into the parity-authority directory
   */

  parity_yml = generateYML(hh);

  fs.writeFile('parity-authority/parity.yml', parity_yml, 'utf8',(err) => {   
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