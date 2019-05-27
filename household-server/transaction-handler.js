const authorityHelper = require("../helpers/authority");
const contractHelper = require("../helpers/contract");
const conversionHelper = require("../helpers/conversion");

const HOUSEHOLD_KEY_MAP = [
  "initialized",
  "renewableEnergy",
  "nonRenewableEnergy",
  "producedRenewableEnergy",
  "consumedRenewableEnergy",
  "producedNonRenewableEnergy",
  "consumedNonRenewableEnergy"
];

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
   * Call `getHousehold` constant method.
   * @param {Object} web3 Web3 instance.
   * @returns {
   *  '0': boolean,
   *  '1': number,
   *  '2': number,
   *  '3': number,
   *  '4': number,
   *  '5': number,
   *  '6': number,
   *  address: address,
   *  initialized: boolean,
   *  renewableEnergy: number,
   *  nonRenewableEnergy: number,
   *  producedRenewableEnergy: number,
   *  consumedRenewableEnergy: number,
   *  producedNonRenewableEnergy: number,
   *  consumedNonRenewableEnergy: number
   * }
   * Note '0' till '6' can be ignored.
   */
  getHousehold: async web3 => {
    const { address } = authorityHelper.getAddressAndPassword();
    const contract = new web3.eth.Contract(
      contractHelper.getAbi(),
      contractHelper.getDeployedAddress(await web3.eth.net.getId())
    );
    const householdData = await contract.methods.getHousehold(address).call();
    return Object.keys(householdData).reduce(
      (formattedData, key) => {
        return {
          ...formattedData,
          [HOUSEHOLD_KEY_MAP[key]]:
            typeof householdData[key] === "boolean"
              ? householdData[key]
              : conversionHelper.wsToKWh(householdData[key].toNumber())
        };
      },
      { address: web3.utils.toChecksumAddress(address) }
    );
  },

  /**
   * Call constant methods:
   *  `totalEnergy`,
   *  `totalConsumedEnergy`,
   *  `totalProducedEnergy`,
   *  `totalRenewableEnergy`,
   *  `totalConsumedRenewableEnergy`,
   *  `totalProducedRenewableEnergy`,
   *  `totalNonRenewableEnergy`,
   *  `totalConsumedNonRenewableEnergy` and
   *  `totalProducedNonRenewableEnergy`.
   * @param {Object} web3 Web3 instance.
   * @returns {
   *  totalEnergy: number,
   *  totalConsumedEnergy: number,
   *  totalProducedEnergy: number,
   *  totalRenewableEnergy: number,
   *  totalConsumedRenewableEnergy: number,
   *  totalProducedRenewableEnergy: number,
   *  totalNonRenewableEnergy: number,
   *  totalConsumedNonRenewableEnergy: number,
   *  totalProducedNonRenewableEnergy: number
   * }
   */
  getNetworkStats: async web3 => {
    const contract = new web3.eth.Contract(
      contractHelper.getAbi(),
      contractHelper.getDeployedAddress(await web3.eth.net.getId())
    );

    const [
      totalEnergy,
      totalConsumedEnergy,
      totalProducedEnergy,
      totalRenewableEnergy,
      totalConsumedRenewableEnergy,
      totalProducedRenewableEnergy,
      totalNonRenewableEnergy,
      totalConsumedNonRenewableEnergy,
      totalProducedNonRenewableEnergy
    ] = await Promise.all([
      contract.methods.totalEnergy().call(),
      contract.methods.totalConsumedEnergy().call(),
      contract.methods.totalProducedEnergy().call(),
      contract.methods.totalRenewableEnergy().call(),
      contract.methods.totalConsumedRenewableEnergy().call(),
      contract.methods.totalProducedRenewableEnergy().call(),
      contract.methods.totalNonRenewableEnergy().call(),
      contract.methods.totalConsumedNonRenewableEnergy().call(),
      contract.methods.totalProducedNonRenewableEnergy().call()
    ]);

    const networkStats = {
      totalEnergy: conversionHelper.wsToKWh(totalEnergy.toNumber()),
      totalConsumedEnergy: conversionHelper.wsToKWh(
        totalConsumedEnergy.toNumber()
      ),
      totalProducedEnergy: conversionHelper.wsToKWh(
        totalProducedEnergy.toNumber()
      ),
      totalRenewableEnergy: conversionHelper.wsToKWh(
        totalRenewableEnergy.toNumber()
      ),
      totalConsumedRenewableEnergy: conversionHelper.wsToKWh(
        totalConsumedRenewableEnergy.toNumber()
      ),
      totalProducedRenewableEnergy: conversionHelper.wsToKWh(
        totalProducedRenewableEnergy.toNumber()
      ),
      totalNonRenewableEnergy: conversionHelper.wsToKWh(
        totalNonRenewableEnergy.toNumber()
      ),
      totalConsumedNonRenewableEnergy: conversionHelper.wsToKWh(
        totalConsumedNonRenewableEnergy.toNumber()
      ),
      totalProducedNonRenewableEnergy: conversionHelper.wsToKWh(
        totalProducedNonRenewableEnergy.toNumber()
      )
    };

    return networkStats;
  }
};
