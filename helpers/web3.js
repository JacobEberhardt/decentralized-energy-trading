const Web3 = require("web3");
const truffleConfig = require("../truffle-config");

module.exports = {
  initWeb3: (network = "ganache") => {
    const { host, port } = truffleConfig.networks[network];
    return new Web3(`http://${host}:${port}`);
  }
};
