const web3Utils = require("web3-utils");
const sha256 = require("js-sha256");

const web3Helper = require("../helpers/web3");
const zokratesHelper = require("../helpers/zokrates");
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
   * @param {number} meterReading Current meter reading in kWh.
   */
  putMeterReading: async (config, web3, meterReading) => {
    const { address, password } = config;
    const timestamp = Date.now();

    const paddedParamsHex = zokratesHelper.padPackParams512(
      meterReading,
      timestamp,
      address
    );

    const bytesParams = web3Utils.hexToBytes(paddedParamsHex);
    const hash = sha256(bytesParams);

    const { signature } = await web3Helper.signData(
      web3,
      address,
      password,
      hash
    );
    return ned.putSignedMeterReading(config.nedUrl, address, {
      signature,
      hash,
      timestamp,
      meterReading
    });
  }
};
