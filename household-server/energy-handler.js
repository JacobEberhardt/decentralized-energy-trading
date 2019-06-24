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
   * @param {number} energy Delta of produced and consumed.
   */
  putEnergy: async (config, web3, energy) => {
    const { signature, signerAddress, data } = await web3Helper.signData(
      web3,
      config.address,
      config.password,
      energy
    );
    return ned.putEnergy(config.nedUrl, signerAddress, signature, data);
  }
};
