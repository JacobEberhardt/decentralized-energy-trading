const web3Utils = require("web3-utils");

const conversionHelper = require("../helpers/conversion");
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
   * @param {number} meterReading current meter Reading.
   */
  putEnergy: async (config, web3, energy) => {
    const { address, password } = config;
    const timestamp = Date.now();
    const hash = web3Utils.soliditySha3(
      conversionHelper.kWhToWs(energy),
      address,
      timestamp
    );
    const { signature, signerAddress } = await web3Helper.signData(
      web3,
      address,
      password,
      hash
    );
    return ned.putEnergy(config.nedUrl, signerAddress, {
      signature,
      hash,
      timestamp,
      energy
    });
  }
};
