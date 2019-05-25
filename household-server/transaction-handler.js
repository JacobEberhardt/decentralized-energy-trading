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
   * Query `deeds` from contract within the range `fromBlock` to `latestBlock`.
   * @param {Object} web3
   * @param {number} fromBlockNumber
   * @returns {{
   *  blockNumber: number,
   *  blockHash: string,
   *  from: string,
   *  to: string,
   *  energyTransferred: number,
   * }[]}
   */
  collectDeeds: async (web3, fromBlockNumber = 0) => {
    const contract = new web3.eth.Contract(
      contractHelper.getAbi(),
      contractHelper.getDeployedAddress()
    );
    const latestBlockNumber = await web3.eth.getBlockNumber();

    // Fill array with [fromBlockNumber, fromBlockNumber + 1, ..., latestBlockNumber]
    const blockNumberRange = Array.from(
      {
        length: latestBlockNumber - fromBlockNumber
      },
      (emptyElement, i) => fromBlockNumber + i
    );

    // Concurrently resolve promises for `deedsLength(blockNumber)`
    const deedsLengths = (await Promise.all(
      blockNumberRange.map(blockNumber =>
        contract.methods.deedsLength(blockNumber).call()
      )
    )).map(lengthBN => lengthBN.toNumber());

    // Create array with tuples [blockNumber, deedIndex]
    const blockNumberToDeedIndex = blockNumberRange
      .map((blockNumber, i) => {
        const indices = Array.from(
          { length: deedsLengths[i] },
          (emptyElement, i) => i
        );
        if (indices.length === 0) {
          return [];
        }
        return indices.map(i => [blockNumber, i]);
      })
      .flat()
      .filter(tuple => tuple.length > 0);

    // Concurrently resolve promises for `deeds(blockNumber, index)`
    const deeds = await Promise.all(
      blockNumberToDeedIndex.map(async ([blockNumber, index]) => {
        const deed = await contract.methods.deeds(blockNumber, index).call();
        return {
          blockNumber,
          blockHash: (await web3.eth.getBlock(blockNumber)).hash,
          from: deed.from,
          to: deed.to,
          renewableEnergyTransferred: conversionHelper.wsToKWh(
            deed.renewableEnergyTransferred.toString()
          )
        };
      })
    );

    return deeds;
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
    for (const key in txReceipt) {
      if (typeof txReceipt[key] === "boolean") {
        hhStats[key] = txReceipt[key];
      } else {
        hhStats[key] = conversionHelper.wsToKWh(txReceipt[key].toNumber());
      }
    }

    return hhStats;
  }
};
