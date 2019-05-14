module.exports = {
  networks: {
    ganache: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "123456"
    },
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*"
    },
    authority: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "8995"
    }
  },
  compilers: {
    solc: {
      version: "0.5.2"
    }
  }
};
