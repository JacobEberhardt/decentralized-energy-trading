/**
 * This module interfaces with the `authority` node.
 */
module.exports = {
  /**
   * Signs given data.
   * @param {Object} web3 Web3 instance.
   * @param {string} address Signer address.
   * @param {string} password Password to unlock signer.
   * @param {any} data Arbitrary data to sign.
   */
  signData: async (web3, address, password, data) => {
    const dataStr = JSON.stringify(data);
    const signature = await web3.eth.personal.sign(dataStr, address, password);
    return {
      data,
      signature,
      signerAddress: address
    };
  }
};
