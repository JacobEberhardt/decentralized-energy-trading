const { readFileSync } = require("./file");
const { authKeyPath, authPasswordPath } = require("../household-server-config");

/**
 * This module contains helper functions that are related to the authority node.
 */
module.exports = {
  /**
   * Returns address and password of household / authority from respective config files.
   * The paths are specified in `household-server-config.js`.
   * @returns {{ address: string, password: string }} where `address` is the ethereum
   * address from the authority and `password` the passphrase to unlock the authority node.
   */
  getAddressAndPassword: () => {
    const password = readFileSync(`./${authPasswordPath}`);
    const keyFileJson = readFileSync(`./${authKeyPath}`);
    const { address } = JSON.parse(keyFileJson);
    return {
      address: `0x${address}`,
      password: password.split("\n")[0]
    };
  }
};
