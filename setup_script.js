const fs = require('fs')
const ps = require('portscanner')

let dbPorts;
let hhPorts;


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
      name:dockerized_network
`

}

let args = process.argv.slice(2);

let netting_yml;
let wE;
let nE;

if((args.length === 2) && args[0] >= 1 && args[1] >= 1){
    
  wE = Number(args[0]);
  nE = Number(args[1]);

  

  netting_yml = generateYML(wE, nE);

  fs.writeFile('netting_test.yml', netting_yml, 'utf8',(err) => {   
    if (err) throw err;
  })

}else{
    console.log("ERROR! The number of inputs provided is less than two OR inputs are not numbers OR not numbers >= 1! \nThe Setup-Script stopped! \nPlease provide for the numbers of HHs two integer values >= 1!");
}

