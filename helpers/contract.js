const UtilityArtifact = require("../build/contracts/Utility.json");

module.exports = {
  /**
   * Helper function to retrieve the deployed contract address of Utility.
   * @param {string} networkId
   */
  getDeployedAddress: (networkId = "123456") => {
    const networkIds = Object.keys(UtilityArtifact.networks);
    if (networkIds.indexOf(networkId) === -1) {
      throw new Error("No deployed contract for given network id.");
    }
    return UtilityArtifact.networks[networkId].address;
  },
  /**
   * Helper function to retrieve the ABI of Utility.
   */
  getAbi: () => UtilityArtifact.abi
};
