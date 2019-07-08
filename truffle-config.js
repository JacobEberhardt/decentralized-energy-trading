module.exports = {
  networks: {
    ganache: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "1234"
    },
    authority: {
      host: "127.0.0.1",
      port: 8546,
      network_id: "8995",
      websockets: true
    },
    authority_docker: {
      host: "127.0.0.1",
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
