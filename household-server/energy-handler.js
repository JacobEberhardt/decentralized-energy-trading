const web3Utils = require("web3-utils");
const sha256 = require("js-sha256");

const web3Helper = require("../helpers/web3");
const zokratesHelper = require("../helpers/zokrates");
const conversionHelper = require("../helpers/conversion");

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
   * @param {Object} utilityContract web3 contract instance.
   * @param {number} meterReading Current meter reading in kWh.
   */
  putMeterReading: async (config, web3, utilityContract, meterReading) => {
    const { address, password } = config;
    const timestamp = Date.now();

    const paddedParamsHex = zokratesHelper.padPackParams512(
      conversionHelper.kWhToWs(Math.abs(meterReading)),
      timestamp,
      address
    );

    const bytesParams = web3Utils.hexToBytes(paddedParamsHex);
    const hash = `0x${sha256(bytesParams)}`;

    await web3.eth.personal.unlockAccount(address, password, null);
    utilityContract.methods
      .updateRenewableEnergy(address, web3Utils.hexToBytes(hash))
      .send({ from: address }, (error, txHash) => {
        if (error) {
          console.error(error);
          throw error;
        }
        console.log("dUtility.updateRenewableEnergy txHash", txHash);
      });

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
