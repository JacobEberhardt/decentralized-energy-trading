const BN = require("bn.js");

/**
 * This module contains helper functions that convert values.
 */
module.exports = {
  /**
   * Converts kWh to Ws and returns result as string.
   * @param {number | string} kWh
   * @returns {string} The converted kWh in Ws as a string.
   */
  kWhToWs: kWh => {
    const kWhBN = new BN(kWh);
    const kWhInWsBN = new BN(3600000);
    return kWhBN.mul(kWhInWsBN).toString();
  }
};
