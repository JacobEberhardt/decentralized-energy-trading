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
    /*const kWhBN = new BN(kWh);
    const kWhInWsBN = new BN(3600000);
    
    console.log("kWhBN", kWhBN);

    return kWhBN
      .mul(kWhInWsBN)
      .divRound(new BN(1))
      .toString();
    */
    const kWhToWs = 3600000;
    let ws = kWh * kWhToWs;

    return (Math.round(ws)).toString();

  },
  /**
   * Converts kWh to Ws and returns result as string.
   * @param {number | string} ws
   * @returns {number} The converted Ws in kWh as a string.
   */
  wsToKWh: ws => {
    /*
    const wsBN = new BN(ws);
    const kWhInWsBN = new BN(3600000);
    return wsBN.div(kWhInWsBN).toNumber();
    */
    
    const wsTokWh = 3600000;
    let kWh = ws/wsTokWh;
    return kWh.toFixed(4).toString();

  }
};
