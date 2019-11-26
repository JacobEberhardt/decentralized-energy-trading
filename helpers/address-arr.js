const { ZERO_ADDRESS } = require("../helpers/constants");

module.exports = {
  /**
   * Hack function to enforce address array length of 2.
   * @param {string[]} addressArr List of HH addresses.
   * @param {number} length Length to enforce.
   */
  //I THINK THIS IS WHAT CAUSED ALL THE PAINNNNNNN
  enforceAddressArrLength: (addressArr, length = 2) => {
    const zeroAddressArr = new Array(length).fill(ZERO_ADDRESS);
    return zeroAddressArr.map((zeroAddress, i) => addressArr[i] || zeroAddress);
  }
};
