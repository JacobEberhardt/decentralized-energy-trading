const web3Utils = require("web3-utils");
const sha256 = require("js-sha256");

const web3Helper = require("../helpers/web3");
const zokratesHelper = require("../helpers/zokrates");
const conversionHelper = require("../helpers/conversion");

const ned = require("./apis/ned");

module.exports = {
  /**
   * Collects transfers from NED sever and writes them into DB.
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
   * @param {number} meterDelta Current meter change in kWh.
   */
  putMeterReading: async (config, web3, utilityContract, meterDelta) => {
    const { address, password } = config;
    const timestamp = Date.now();

    const hash = zokratesHelper.packAndHash(meterDelta);

    await web3.eth.personal.unlockAccount(address, password, null);
    utilityContract.methods
      .updateRenewableEnergy(address, web3Utils.hexToBytes(hash))
      .send({ from: address }, (error, txHash) => {
        if (error) {
          console.error(error);
          throw error;
        }
        console.log(`Energy hash = ${hash}`);
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
      meterDelta
    });
  }
};
