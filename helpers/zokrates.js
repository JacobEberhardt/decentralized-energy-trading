const web3Utils = require("web3").utils;
const sha256 = require("js-sha256");


module.exports = {
  padPackParams256: (meterDelta) => {
    const meterDeltaHex = web3Utils.numberToHex(meterDelta);
    return web3Utils.padLeft(meterDeltaHex, 128);
  },

  packAndHash: (meterDelta) => {
    const meterDeltaHex = web3Utils.numberToHex(Math.abs(meterDelta));
    let meterDeltaPadded = web3Utils.padLeft(meterDeltaHex, 128);
    return `0x${sha256(web3Utils.hexToBytes(meterDeltaPadded))}`;
  }
};
