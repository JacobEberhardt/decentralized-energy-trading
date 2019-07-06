const Web3 = require("web3");
const web3Utils = require("web3-utils");
const truffleConfig = require("../truffle-config");

module.exports = {
  initWeb3: (network = "ganache") => {
    const { host, port } = truffleConfig.networks[network];
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
  verifySignature: async (web3, data, signature, signerAddress) => {
    const dataStr = JSON.stringify(data);
    const recoveredAddress = await web3.eth.personal.ecRecover(
      dataStr,
      signature
    );
    return (
      web3Utils.toChecksumAddress(signerAddress) ===
      web3Utils.toChecksumAddress(recoveredAddress)
    );
  }
};
