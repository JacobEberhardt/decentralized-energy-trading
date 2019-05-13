const UtilityArtifact = require("../build/contracts/FifsUtility.json");

/**
 * This module contains helper functions to interface with the contract artifacts created
 * by truffle.
 */
module.exports = {
  /**
   * Helper function to retrieve the deployed contract address of Utility.
   * @param {string} networkId Id of network where contract is deployed.
   * @returns {string} Contract address of deployed Utility contract.
   */
  getDeployedAddress: (networkId = "8995") => {
    const networkIds = Object.keys(UtilityArtifact.networks);
    if (networkIds.indexOf(`${networkId}`) === -1) {
      throw new Error("No deployed contract for given network id.");
    }
    return UtilityArtifact.networks[networkId].address;
  },
  /**
   * Helper function to retrieve the ABI of the Utility contract.
   * @returns {Array} ABI of Utility contract.
   */
  getAbi: () => UtilityArtifact.abi
};
