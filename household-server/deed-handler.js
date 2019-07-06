const db = require("./apis/db");
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
   * }} config Server configuration
   */
  collectDeeds: async config => {
    const latestSavedTimestamp = await db.getLatestTimestamp(
      config.dbUrl,
      config.dbName,
      config.utilityDataCollection
    );
    const deeds = await ned.getDeeds(
      config.nedUrl,
      config.address,
      latestSavedTimestamp + 1
    );
    return deeds.length > 0
      ? db.bulkWriteToDB(config.dbUrl, config.dbName, config.collection, deeds)
      : [];
  }
};
