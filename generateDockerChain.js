const keyth = require('keythereum')
const fs = require('fs')

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

  
  parity_yml = generateYML(hh);

  fs.writeFile('parity-authority/parity_test.yml', parity_yml, 'utf8',(err) => {   
    if (err) throw err;
  })
  console.log("DONE!");

}else{
    console.log("ERROR! The number of inputs provided is not correct OR the input is not a number OR not a numbers >= 3! \nThe Setup-Script stopped! \nPlease provide for the numbers of HHs an integer value >= 3! \nIF YOU ONLY WANT A CHAIN WITH 2 NODES, THE STANDARD CONFIGURATION IS SUFFICIENT!");
}