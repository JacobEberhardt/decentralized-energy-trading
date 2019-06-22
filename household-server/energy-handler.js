const web3Helper = require("../helpers/web3");
const ned = require("./apis/ned");

module.exports = {
  /**
   * Collects deeds from NED sever and writes them into DB.
   * @param {{
   *   host: string,
   *   port: number,
   *   dbUrl: string,
   *   nedUrl: string,
   *   network: string,
   *   address: string,
   *   password: string,
   *   dbName: string,
   *   sensorDataCollection: string,
   *   utilityDataCollection: string
   * }} config Server configuration.
   * @param {Object} web3 Web3 instance.
   * @param {number} energyDelta Delta of produced and consumed.
   */
  putEnergy: async (config, web3, energyDelta) => {
    const signedData = await web3Helper.signData(
      web3,
      config.address,
      config.password,
      energyDelta
    );
    return ned.putEnergy(config.nedUrl, config.address, signedData);
  }
};
