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
      websockets: true,
      from: "0x00Bd138aBD70e2F00903268F3Db08f2D25677C9e"
    },
    authority_1: {
      host: "127.0.0.1",
      port: 8556,
      network_id: "8995",
      websockets: true
    },
    authority_2: {
      host: "127.0.0.1",
      port: 8566,
      network_id: "8995",
      websockets: true
    },
    authority_3: {
      host: "127.0.0.1",
      port: 8576,
      network_id: "8995",
      websockets: true
    },
    authority_4: {
      host: "127.0.0.1",
      port: 8586,
      network_id: "8995",
      websockets: true
    },
    benchmark: {
      host: "127.0.0.1",
      port: 8546,
      network_id: "8995",
      websockets: true,
      from: "0x00Bd138aBD70e2F00903268F3Db08f2D25677C9e"
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
