const web3Utils = require("web3").utils;
const stripHexPrefix = require("strip-hex-prefix");

module.exports = {
  padPackParams256: (meterDelta) => {
    const meterDeltaHex = web3Utils.numberToHex(meterDelta);
    // Pad concatenated hex params string to have length of 512 bits (128 hex digits).
    return web3Utils.padLeft(meterDeltaHex, 64);
  }
};
