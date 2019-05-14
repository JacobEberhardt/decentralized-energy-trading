const authorityHelper = require("../helpers/authority");
const contractHelper = require("../helpers/contract");
const conversionHelper = require("../helpers/conversion");

/**
 * This handler creates, signs and sends transactions to the Utility contract.
 */
module.exports = {
  /**
   * Call `updateRenewableEnergy` contract method.
   * @param {Object} web3 Web3 instance.
   * @param {{ produce: number, consume: number }} payload The parameters for calling
   * `updateRenewableEnergy` function.
   * @returns {Promise<Object>} Promise containing the transaction receipt.
   */
  updateRenewableEnergy: async (web3, payload) => {
    const { produce, consume } = payload;
    const { address, password } = authorityHelper.getAddressAndPassword();
    try {
      const contract = new web3.eth.Contract(
        contractHelper.getAbi(),
        contractHelper.getDeployedAddress(await web3.eth.net.getId())
      );
      await web3.eth.personal.unlockAccount(address, password, null);
      const txReceipt = await contract.methods
        .updateRenewableEnergy(
          address,
          conversionHelper.kWhToWs(produce),
          conversionHelper.kWhToWs(consume)
        )
        .send({ from: address, gasLimit: 16179379 });
      return txReceipt;
    } catch (error) {
      throw error;
    }
  }
};
