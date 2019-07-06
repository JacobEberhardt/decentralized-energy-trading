const UtilityArtifact = require("../build/contracts/Utility.json");
const dUtilityArtifact = require("../build/contracts/dUtility.json");
const OwnedSet = require("../build/contracts/OwnedSet.json");
const { UTILITY_ADDRESS, OWNED_SET_ADDRESS } = require("../helpers/constants");

/**
 * Maps contract name to hard coded address in authority setup and truffle artifact.
 */
const CONTRACTS_MAP = {
  utility: {
    addressInAuthority: UTILITY_ADDRESS,
    artifact: UtilityArtifact
  },
  dUtility: {
    addressInAuthority: UTILITY_ADDRESS,
    artifact: dUtilityArtifact
  },
  ownedSet: {
    addressInAuthority: OWNED_SET_ADDRESS,
    artifact: OwnedSet
  }
};

/**
 * This module contains helper functions to interface with the contract artifacts created
 * by truffle.
 */
module.exports = {
  /**
   * Helper function to retrieve the deployed contract address of Utility.
   * @param {string} contractName Name of contract. "utility" | "ownedSet"
   * @param {string} networkId Id of network where contract is deployed.
   * @returns {string} Contract address of deployed Utility contract.
   */
  getDeployedAddress: (contractName, networkId = 8995) => {
    const networkIdString = `${networkId}`;
    const contract = CONTRACTS_MAP[contractName];

    // NOTE: 8995 is the id of an authority network. As the address is defined via the
    //       chain spec we return the hard coded address.
    if (networkIdString === "8995") {
      return contract.addressInAuthority;
    } else {
      const networkIds = Object.keys(contract.artifact.networks);
      if (networkIds.indexOf(networkIdString) === -1) {
        throw new Error("No deployed contract for given network id.");
      }
      return contract.artifact.networks[networkId].address;
    }
  },
  /**
   * Helper function to retrieve the ABI of the Utility contract.
   * @param {string} contractName Name of contract.
   * @returns {Array} ABI of Utility contract.
   */
  getAbi: contractName => CONTRACTS_MAP[contractName].artifact.abi
};
