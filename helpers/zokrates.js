const web3Utils = require("web3").utils;
const stripHexPrefix = require('strip-hex-prefix');

module.exports = {
  padPackParams512: (meterReading, timestamp, address) => {
    const meterReadingHex = web3Utils.numberToHex(meterReading);
    const timestampHex = web3Utils.numberToHex(timestamp);
    const paramsHex = `${meterReadingHex}${stripHexPrefix(
      timestampHex
    )}${stripHexPrefix(address)}`;

    // Pad concatenated hex params string to have length of 512 bits (128 hex digits).
    return web3Utils.padLeft(paramsHex, 128);
  },
};
