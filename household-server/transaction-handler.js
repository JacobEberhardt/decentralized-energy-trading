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
      .send({ from: address });
    return txReceipt;
  },
  /**
   * Call `getHousehold` contract method.
   * @param {Object} web3 Web3 instance.
   * @returns {Object} Object containing household stats.
   */
  getHousehold: async web3 => {
    const { address, password } = authorityHelper.getAddressAndPassword();
    const contract = new web3.eth.Contract(
      contractHelper.getAbi(),
      contractHelper.getDeployedAddress(await web3.eth.net.getId())
    );
    await web3.eth.personal.unlockAccount(address, password, null);

    const txReceipt = await contract.methods.getHousehold(address).call();
    let hhStats = {};
    for (var key in txReceipt) {
      if (typeof txReceipt[key] === "boolean") {
        hhStats[key] = txReceipt[key];
      } else {
        hhStats[key] = conversionHelper.wsToKWh(txReceipt[key].toNumber());
      }
    }

    return hhStats;
  }
};
