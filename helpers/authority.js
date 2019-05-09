const { readFileSync } = require("./file");
const { authKeyPath, authPasswordPath } = require("../household-server-config");

module.exports = {
  /**
   * Returns address and password of household / authority from respective parity files.
   * The paths are specified in `household-server-config.js`.
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
