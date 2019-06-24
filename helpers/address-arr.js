const { ZERO_ADDRESS } = require("../helpers/constants");

module.exports = {
  /**
   * Hack function to enforce address array length of 2.
   * @param {string[]} addressArr List of HH addresses.
   */
  enforceAddressArrLength: addressArr => {
    const zeroAddressArr = new Array(2).fill(ZERO_ADDRESS);
    return zeroAddressArr.map((zeroAddress, i) => addressArr[i] || zeroAddress);
  }
};
