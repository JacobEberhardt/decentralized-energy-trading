module.exports = {
  // URL of a running MongoDB instance
  dbUrl: "mongodb://127.0.0.1:27017",
  // URL of NED server
  nedUrl: "http://127.0.0.1:3005",
  // IP on which the household server should run
  host: "127.0.0.1",
  // Port on which the household server should listen
  port: 3002,
  // Name of the DB
  dbName: "decentralized_energy",
  // Name of the Collection where the sensor data is saved
  sensorDataCollection: "sensor_data",
  // Name of the Collection where the transfers from the utility contract is saved
  utilityDataCollection: "utility_data",
  // Name of the Collection where the meterReading for the household is saved
  meterReadingCollection: "meter_reading",
  // Path to the parity key file json of the authority node that is connected to the household server
  address: "0x00bd138abd70e2f00903268f3db08f2d25677c9e",
  // Path to the password file to unlock above authority node
  password: "node0",
  // Name of JSON RPC interface specified in `truffle-config.js`
  network: "authority",
  // Timestamp of submission deadline of billing period 0, in seconds
  submissionDeadlineBillingEpoch: 15 + 15 * 60, // 15s (sensorInterval; see below) plus 15min after end of billing period
  // Time Interval of the Mock-Sensor sending Data to the Household Server in ms
  sensorInterval: 15000
};
