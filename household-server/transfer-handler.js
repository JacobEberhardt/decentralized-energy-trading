const db = require("./apis/db");
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
   * }} config Server configuration
   */
  collectTransfers: async config => {
    const latestSavedTimestamp = await db.getLatestTimestamp(
      config.dbUrl,
      config.dbName,
      config.utilityDataCollection
    );
    const transfers = await ned.getTransfers(
      config.nedUrl,
      config.address,
      latestSavedTimestamp + 1
    );
    return transfers.length > 0
      ? db.bulkWriteToDB(
          config.dbUrl,
          config.dbName,
          config.utilityDataCollection,
          transfers
        )
      : [];
  }
};
