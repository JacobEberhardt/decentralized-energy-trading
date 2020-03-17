const Web3 = require("web3");
const web3Utils = require("web3-utils");
const truffleConfig = require("../truffle-config");

module.exports = {
  initWeb3: (network = "authority") => {
    const { host, port } = truffleConfig.networks[network];
    console.log("WEB3 HOST: ", host)
    console.log("WEB3 PORT: ", port)
    let test = new Web3(`ws://${host}:${port}`, null, {})
    //console.log("RETURNED WEB3 OBJECT: ", test)
    return new Web3(`ws://${host}:${port}`, null, {});
  },
  /**
   * Signs given data.
   * @param {Object} web3 Web3 instance.
   * @param {string} signerAddress Signer address.
   * @param {string} password Password to unlock signer.
   * @param {any} data Arbitrary data to sign.
   */
  signData: async (web3, signerAddress, password, data) => {
    const dataStr = JSON.stringify(data);
    const signature = await web3.eth.personal.sign(
      dataStr,
      signerAddress,
      password
    );
    return {
      data,
      signature,
      signerAddress
    };
  },
  /**
   * Verifies if signature is valid.
   * @param {Object} web3 Web3 instance.
   * @param {any} data Signed data.
   * @param {string} signature Signature.
   * @param {string} address Address of singer.
   */
  verifySignature: async (web3, data, signature) => {
    const dataStr = JSON.stringify(data);
    const recoveredAddress = await web3.eth.personal.ecRecover(
      dataStr,
      signature
    );
    return web3Utils.toChecksumAddress(recoveredAddress);
  }
};
