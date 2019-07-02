const web3Utils = require("web3-utils");
const sha256 = require("js-sha256");

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
   * @param {number} meterReading Current meter reading in kWh.
   */
  putMeterReading: async (config, web3, meterReading) => {
    const { address, password } = config;
    const timestamp = Date.now();

    const meterReadingHex = web3Utils.numberToHex(meterReading);
    const timestampHex = web3Utils.numberToHex(timestamp);
    const paramsHex = `${meterReadingHex}${web3Utils.stripHexPrefix(
      timestampHex
    )}${web3Utils.stripHexPrefix(address)}`;

    // Pad concatenated hex params string to have length of 512 bits (128 hex digits).
    const paddedParamsHex = web3Utils.padLeft(paramsHex, 128);
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
