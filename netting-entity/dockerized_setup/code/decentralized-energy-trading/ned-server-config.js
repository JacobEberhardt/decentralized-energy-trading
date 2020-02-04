
    module.exports = {
      // IP on which the ned server should run
      host: "127.0.0.1",
      // Port on which the ned server should listen
      port: 3000,
      // Ethereum address of NED node
      address: "0x00bd138abd70e2f00903268f3db08f2d25677c9e",
      // Password to unlock NED node
      password: "node0",
      // Name of JSON RPC interface specified in truffle-config.js
      network: "authority",
      // Time Interval of the ned server triggering the netting in the ZoKrates execution environment
      nettingInterval: 10000,
      // Working directory of the file and the child process
      workingDir: "./ned-server",
      // File name to execute
      fileName: "helloworld.sh",
      // Execution environment for the file
      executionEnv: "bash",
      //No. of HHs with Energy Production
      hhProduce: 2,
      //No. of HHs with No Energy Production -> Only Consumption
      hhConsume: 2
    };