const request = require("request-promise");

/**
 * This module interfaces with the NED server.
 */
module.exports = {
  /**
   * Fetches deeds from off-chain utility of NED server.
   * @param {string} nedUrl Base URL of NED server.
   * @param {string} householdAddress Address of requesting household.
   * @param {number} fromDate Optional from query.
   */
  getDeeds: (nedUrl, householdAddress, fromDate = 0) => {
    return request(`${nedUrl}/deeds/${householdAddress}?from=${fromDate}`);
  },
  /**
   * Send PUT signed energy data to NED server.
   * @param {string} nedUrl Base URL of NED server.
   * @param {string} householdAddress Address of sending household.
   * @param {{
   *  energy: number,
   *  hash: string,
   *  timestamp: number,
   *  signature: string
   * }} payload Energy json.
   */
  putSignedMeterReading: (nedUrl, householdAddress, payload) => {
    return request(`${nedUrl}/energy/${householdAddress}`, {
      method: "PUT",
      json: payload
    });
  },
  /**
   * Fetches current stats of a household.
   * @param {string} nedUrl Base URL of NED server.
   * @param {string} householdAddress Address of requesting household.
   */
  getHousehold: (nedUrl, householdAddress) => {
    return request(`${nedUrl}/household/${householdAddress}`);
  },
  /**
   * Fetches current stats of whole network.
   * @param {string} nedUrl Base URL of NED server.
   */
  getNetwork: (nedUrl, householdAddress) => {
    return request(`${nedUrl}/network`);
  }
};
