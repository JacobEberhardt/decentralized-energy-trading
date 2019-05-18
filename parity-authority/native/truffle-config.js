module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 8540,
      network_id: "*",
    },
  },

  compilers: {
    solc: {
      version: "0.4.22", // ex:  "0.4.20". (Default: Truffle's installed solc)
    },
  },
};
