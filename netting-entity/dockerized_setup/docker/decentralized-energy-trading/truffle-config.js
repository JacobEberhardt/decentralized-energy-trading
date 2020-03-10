
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
    },
    authority_3: {
      host: "parity-authority-1",
      port: 8546,
      network_id: "8995",
      websockets: true
    },
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
};