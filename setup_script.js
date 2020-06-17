const fs = require('fs')
const ncp = require("ncp").ncp;

let dbPorts;
let hhPorts;

/**
 * This function initializes the relevant sub-directories for the dockerized setup, which are referenced by the Dockerfiles
 * for the mock-sensor, the netting-entity and the household-server
 */
function initialize(){
  console.log("Initializing Project Directories for the Dockerized-Setup...")

  let mock_sensor_Dfile = `FROM node:10

  # Create app directory
  WORKDIR /usr/src/app
  
  # Get Source
  COPY ./docker/decentralized-energy-trading/ /usr/src/app
  
  # Install app dependencies
  RUN yarn install`;

  let hh_server_Dfile = `FROM node:10

  # Create app directory
  WORKDIR /usr/src/app
  
  # Get Source
  #RUN git clone https://github.com/JacobEberhardt/decentralized-energy-trading.git
  
  COPY ./docker/decentralized-energy-trading/ /usr/src/app
  
  # Install app dependencies
  
  RUN yarn install`;

  let netting_entity_Dfile = `FROM node:10

  # Create app directory
  WORKDIR /usr/src/app
  
  # Get Source
  #RUN git clone https://github.com/JacobEberhardt/decentralized-energy-trading.git
  COPY ./docker/decentralized-energy-trading/ /usr/src/app
  
  
  # Install app dependencies
  RUN yarn install
  
  # Install ZoKrates
  RUN curl -LSfs get.zokrat.es | sh
  ENV PATH="/root/.zokrates/bin:\${PATH}"
  ENV ZOKRATES_HOME="/root/.zokrates/stdlib"`;
  fs.writeFile('./mock-sensor/Dockerfile', mock_sensor_Dfile, 'utf8',(err) => {   
    if (err) throw err;
  })

  fs.writeFile('./household-server/Dockerfile', hh_server_Dfile, 'utf8',(err) => {   
    if (err) throw err;
  })

  fs.writeFile('./netting-entity/dockerized_setup/Dockerfile', netting_entity_Dfile, 'utf8',(err) => {   
    if (err) throw err;
  })

  ncp("./.circleci", "./household-server/docker/decentralized-energy-trading/.circleci", function (err) {
    if (err) {
      return console.error(err);
    }
   });

   ncp("./.circleci", "./netting-entity/dockerized_setup/docker/decentralized-energy-trading/.circleci", function (err) {
    if (err) {
      return console.error(err);
    }
   });

   ncp("./helpers", "./mock-sensor/docker/decentralized-energy-trading/helpers", function (err) {
    if (err) {
      return console.error(err);
    }
   });
  ncp("./helpers", "./household-server/docker/decentralized-energy-trading/helpers", function (err) {
    if (err) {
      return console.error(err);
    }
   });

   ncp("./helpers", "./netting-entity/dockerized_setup/docker/decentralized-energy-trading/helpers", function (err) {
    if (err) {
      return console.error(err);
    }
   });

   ncp("./scripts", "./household-server/docker/decentralized-energy-trading/scripts", function (err) {
    if (err) {
      return console.error(err);
    }
   });

   ncp("./scripts", "./netting-entity/dockerized_setup/docker/decentralized-energy-trading/scripts", function (err) {
    if (err) {
      return console.error(err);
    }
   });

   ncp("./package.json", "./mock-sensor/docker/decentralized-energy-trading/package.json", function (err) {
    if (err) {
      return console.error(err);
    }
   });

   ncp("./package.json", "./household-server/docker/decentralized-energy-trading/package.json", function (err) {
    if (err) {
      return console.error(err);
    }
   });

   ncp("./package.json", "./netting-entity/dockerized_setup/docker/decentralized-energy-trading/package.json", function (err) {
    if (err) {
      return console.error(err);
    }
   });

   ncp("./yarn.lock", "./mock-sensor/docker/decentralized-energy-trading/yarn.lock", function (err) {
    if (err) {
      return console.error(err);
    }
   });

   ncp("./yarn.lock", "./household-server/docker/decentralized-energy-trading/yarn.lock", function (err) {
    if (err) {
      return console.error(err);
    }
   });

   ncp("./yarn.lock", "./netting-entity/dockerized_setup/docker/decentralized-energy-trading/yarn.lock", function (err) {
    if (err) {
      return console.error(err);
    }
   });

   ncp("./ned-server-config.js", "./household-server/docker/decentralized-energy-trading/ned-server-config.js", function (err) {
    if (err) {
      return console.error(err);
    }
   });

   ncp("./ned-server-config.js", "./netting-entity/dockerized_setup/docker/decentralized-energy-trading/ned-server-config.js", function (err) {
    if (err) {
      return console.error(err);
    }
   });

   ncp("./household-server-config.js", "./mock-sensor/docker/decentralized-energy-trading/household-server-config.js", function (err) {
    if (err) {
      return console.error(err);
    }
   });
   ncp("./household-server-config.js", "./household-server/docker/decentralized-energy-trading/household-server-config.js", function (err) {
    if (err) {
      return console.error(err);
    }
   });

   ncp("./household-server-config.js", "./netting-entity/dockerized_setup/docker/decentralized-energy-trading/household-server-config.js", function (err) {
    if (err) {
      return console.error(err);
    }
   });

   ncp("./LICENSE", "./mock-sensor/docker/decentralized-energy-trading/LICENSE", function (err) {
    if (err) {
      return console.error(err);
    }
   });

   ncp("./LICENSE", "./household-server/docker/decentralized-energy-trading/LICENSE", function (err) {
    if (err) {
      return console.error(err);
    }
   });

   ncp("./LICENSE", "./netting-entity/dockerized_setup/docker/decentralized-energy-trading/LICENSE", function (err) {
    if (err) {
      return console.error(err);
    }
   });

   ncp("./.env", "./household-server/docker/decentralized-energy-trading/.env", function (err) {
    if (err) {
      return console.error(err);
    }
   });

   ncp("./.env", "./netting-entity/dockerized_setup/docker/decentralized-energy-trading/.env", function (err) {
    if (err) {
      return console.error(err);
    }
   });

   ncp("./.soliumrc.json", "./household-server/docker/decentralized-energy-trading/.soliumrc.json", function (err) {
    if (err) {
      return console.error(err);
    }
   });

   ncp("./.soliumrc.json", "./netting-entity/dockerized_setup/docker/decentralized-energy-trading/.soliumrc.json", function (err) {
    if (err) {
      return console.error(err);
    }
   });

   ncp("./.soliumignore", "./household-server/docker/decentralized-energy-trading/.soliumignore", function (err) {
    if (err) {
      return console.error(err);
    }
   });

   ncp("./.soliumignore", "./netting-entity/dockerized_setup/docker/decentralized-energy-trading/.soliumignore", function (err) {
    if (err) {
      return console.error(err);
    }
   });

   ncp("./.eslintrc.json", "./household-server/docker/decentralized-energy-trading/.eslintrc.json", function (err) {
    if (err) {
      return console.error(err);
    }
   });

   ncp("./.eslintrc.json", "./netting-entity/dockerized_setup/docker/decentralized-energy-trading/.eslintrc.json", function (err) {
    if (err) {
      return console.error(err);
    }
   });

  ncp("./mock-sensor/sensor-config.js", "./mock-sensor/docker/decentralized-energy-trading/mock-sensor/sensor-config.js", function (err) {
    if (err) {
      return console.error(err);
    }
  });

  ncp("./mock-sensor/data-generator.js", "./mock-sensor/docker/decentralized-energy-trading/mock-sensor/data-generator.js", function (err) {
    if (err) {
      return console.error(err);
    }
  });

  ncp("./mock-sensor/index.js", "./mock-sensor/docker/decentralized-energy-trading/mock-sensor/index.js", function (err) {
    if (err) {
      return console.error(err);
    }
  });

  ncp("./household-server/apis", "./household-server/docker/decentralized-energy-trading/household-server/apis", function (err) {
    if (err) {
      return console.error(err);
    }
   });
   ncp("./household-server/energy-handler.js", "./household-server/docker/decentralized-energy-trading/household-server/energy-handler.js", function (err) {
    if (err) {
      return console.error(err);
    }
   });

   ncp("./household-server/index.js", "./household-server/docker/decentralized-energy-trading/household-server/index.js", function (err) {
    if (err) {
      return console.error(err);
    }
   });

   ncp("./household-server/transfer-handler.js", "./household-server/docker/decentralized-energy-trading/household-server/transfer-handler.js", function (err) {
    if (err) {
      return console.error(err);
    }
   });

   ncp("./zokrates-code", "./netting-entity/dockerized_setup/docker/decentralized-energy-trading/zokrates-code", function (err) {
    if (err) {
      return console.error(err);
    }
   });

   ncp("./netting-entity/index.js", "./netting-entity/dockerized_setup/docker/decentralized-energy-trading/netting-entity/index.js", function (err) {
    if (err) {
      return console.error(err);
    }
   });

   ncp("./netting-entity/utility.js", "./netting-entity/dockerized_setup/docker/decentralized-energy-trading/netting-entity/utility.js", function (err) {
    if (err) {
      return console.error(err);
    }
   });

   ncp("./netting-entity/household-handler.js", "./netting-entity/dockerized_setup/docker/decentralized-energy-trading/netting-entity/household-handler.js", function (err) {
    if (err) {
      return console.error(err);
    }
   });

   ncp("./netting-entity/zk-handler.js", "./netting-entity/dockerized_setup/docker/decentralized-energy-trading/netting-entity/zk-handler.js", function (err) {
    if (err) {
      return console.error(err);
    }
   });
}

/**
 * This function generates the section of the YML which will launch n mongoDB containers 
 * Input Parameter: n => Number of Households
 */
function generateMongo(n){
    dbPorts = new Array(n);

    let mongoString = '';

    let pointer = 27017;

    let portMax = (27017);

    /*for(let i = 0; i < n; i++){

        console.log("Pointer Before: ", pointer)

        //dbPorts[i] = 0;

        console.log("Port in DB Array: ", dbPorts[i])

        //pointer = dbPorts[i] + 1;

        console.log("Pointer After: ", pointer)
    }
    */

    for(let i = 0; i < n; i++){
        dbPorts[i] = pointer +i;
        mongoString += `
  mongo-${i+1}:
    image: mongo
    ports:
      - "${dbPorts[i]}:27017"
    networks:
      - 02-docker_parity_net
        `
    }

    return mongoString
}

/**
 * This function generates the section of the YML which will launch n household-servers
 * Input Parameter: n => Number of HHs
 */
function generateServer(n){
    hhPorts = new Array(n);

    let serverString = '';

    let pointer = 3002;

    let portMax = (3002);

/*
    for(let i = 0; i < n; i++){
        ps.findAPortNotInUse(pointer, portMax, '127.0.0.1', function(error, p){
            if(error){
                throw error
            }
            console.log("HH PORT: ",p);
            hhPorts[i] = p;
            console.log("Port in HH Array: ", hhPorts[i])
            pointer = p + 1;
            console.log("New Pointer: ", pointer);
        })
    }
*/

    for(let i = 0; i < n; i++){
        if(pointer+i == 3005){
            hhPorts[i] = pointer + i; //+1;
            //pointer++;
        }
        else{
            hhPorts[i] = pointer + i;
        }

        let key_json = JSON.parse(fs.readFileSync(`./parity-authority/parity/authorities/authority${i+1}.json`, 'utf8'));
        
        let address = "0x" + key_json.address;
        
        serverString += `
  household-server-${i+1}:
    build: './household-server'
    command: yarn run-server -p ${hhPorts[i]} -a ${address} -P node${i+1} -n authority_${i+1} -d mongodb://mongo-${i+1}:27017 -N http://netting-server:3000
    volumes:
      - /usr/src/app
      - /usr/src/app/node_modules
    ports:
      - "${hhPorts[i]}:${hhPorts[i]}"
    restart: unless-stopped
    depends_on:
      - mongo-${i+1}
      - netting-server
    networks:
      - 02-docker_parity_net
        `
    }

    return serverString

}

/**
 * This function generates the section of the YML which will launch n mock-sensors
 * Input Parameter: n => Number of HHs
 */
function generateSensor(wE, nE){

    let sensorString = '';

    let i = 0;

    for(i; i < wE; i++){
        sensorString += `
  sensor-server-${i+1}:
    build: './mock-sensor'
    command: yarn run-sensor -h household-server-${i+1} -p ${hhPorts[i]} -e +
    volumes:
      - /usr/src/app
      - /usr/src/app/node_modules
    restart: unless-stopped
    depends_on:
      - household-server-${i+1}
    networks:
      - 02-docker_parity_net
        `
    }

    for(i; i < (wE+nE); i++){
        sensorString += `
  sensor-server-${i+1}:
    build: './mock-sensor'
    command: yarn run-sensor -h household-server-${i+1} -p ${hhPorts[i]} -e -
    volumes:
      - /usr/src/app
      - /usr/src/app/node_modules
    restart: unless-stopped
    depends_on:
      - household-server-${i+1}
    networks:
      - 02-docker_parity_net
        `
    }

    return sensorString

}

/**
 * This function generates the netting.yml file, which includes sections for launching mongoDB, hh-server and mock-sensor
 * containers
 * Input Parameter: Number of HHs with and without Energy generation
 */

function generateYML(wE, nE){

    let mongodb;
    let hh_server;
    let sensor;

    mongodb = generateMongo(wE + nE);

    hh_server = generateServer(wE + nE);
    
    sensor = generateSensor(wE, nE);

    return `
version: '3.5'
services:

  netting-server:
    build: './netting-entity/dockerized_setup'
    command: yarn run-netting-entity -p 3000 -i 60000
    volumes:
      - /usr/src/app
      - /usr/src/app/node_modules
    ports:
      - "3000:3000"
    restart: unless-stopped
    networks:
      - 02-docker_parity_net

  ${mongodb}
  ${hh_server}
  ${sensor}

networks:
  02-docker_parity_net:
    external:
      name: dockerized_network
`

}

/**
 * At least two arguments have to provided to this script, No. of HH with and without energy
 * 
 */

let args = process.argv.slice(2);

let netting_yml;
let wE;
let nE;

if((args.length === 2) && args[0] >= 1 && args[1] >= 1){
    
  wE = Number(args[0]);
  nE = Number(args[1]);

  initialize();

  netting_yml = generateYML(wE, nE);

  fs.writeFile('netting.yml', netting_yml, 'utf8',(err) => {   
    if (err) throw err;
  })

}else{
    console.log("ERROR! The number of inputs provided is less than two OR inputs are not numbers OR not numbers >= 1! \nThe Setup-Script stopped! \nPlease provide for the numbers of HHs two integer values >= 1!");
}

