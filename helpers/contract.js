const UtilityArtifact = require("../build/contracts/FifsUtility.json");
const { UTILITY_ADDRESS_IN_AUTHORITY } = require("../helpers/constants");

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
  getDeployedAddress: (networkId = 8995) => {
    const networkIdString = `${networkId}`;
    const networkIds = Object.keys(UtilityArtifact.networks);

    // NOTE: 8995 is the id of an authority network. As the address is defined via the
    //       chain spec we return the hard coded address.
    if (networkIdString === "8995") {
      return UTILITY_ADDRESS_IN_AUTHORITY;
    } else {
      if (networkIds.indexOf(networkIdString) === -1) {
        throw new Error("No deployed contract for given network id.");
      }
      return UtilityArtifact.networks[networkId].address;
    }
  },
  /**
   * Helper function to retrieve the ABI of the Utility contract.
   * @returns {Array} ABI of Utility contract.
   */
  getAbi: () => UtilityArtifact.abi
};
