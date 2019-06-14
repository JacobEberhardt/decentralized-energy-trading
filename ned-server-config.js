module.exports = {
  // IP on which the ned server should run
  host: "127.0.0.1",
  // Port on which the ned server should listen
  port: 3005,
  // Path to the parity key file json of the authority node that is connected to the household server
  authKeyPath: "parity-authority/docker/parity/authorities/authority0.json",
  // Path to the password file to unlock above authority node
  authPasswordPath: "parity-authority/docker/parity/authorities/authority0.pwd",
  // Name of JSON RPC interface specified in `truffle-config.js`
  network: "authority",
  // Time Interval of the ned server triggering the netting in the ZoKrates execution environment
  nettingInterval: 10000,
  // Working directory of the file and the child process
  workingDir: "./ned-server",
  // File name to execute
  fileName: "helloworld.sh",
  // Execution environment for the file
  executionEnv: "bash"
};
