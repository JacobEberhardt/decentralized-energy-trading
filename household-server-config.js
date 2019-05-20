module.exports = {
  // URL of a running MongoDB instance
  dbUrl: "mongodb://localhost:27017",
  // IP on which the household server should run
  host: "127.0.0.1",
  // Port on which the household server should listen
  port: 3002,
  // Name of the DB
  dbName: "decentralized_energy",
  // Name of the Collection where the sensor data is saved
  sensorDataCollection: "sensor_data",
  // Name of the Collection where the deeds from the utility contract is saved
  utilityDataCollection: "utility_data",
  // Path to the parity key file json of the authority node that is connected to the household server
  authKeyPath: "parity-authority/docker/parity/authorities/authority0.json",
  // Path to the password file to unlock above authority node
  authPasswordPath: "parity-authority/docker/parity/authorities/authority0.pwd",
  // Name of JSON RPC interface specified in `truffle-config.js`
  network: "authority",
  // Time Interval of the Mock-Sensor sending Data to the Household Server in ms
  sensorInterval: 30000
};
