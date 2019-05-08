const BN = require("bn.js");

module.exports = {
  /**
   * Converts kWh to Ws and returns result as string.
   * @param {number | string} kWh
   */
  kWhToWs: kWh => {
    const kWhBN = new BN(kWh);
    const kWhInWsBN = new BN(3600000);
    return kWhBN.mul(kWhInWsBN).toString();
  }
};
