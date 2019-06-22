const request = require("request-promise");

/**
 * This module interfaces with the NED server.
 */
module.exports = {
  /**
   * Send PUT request to given URL with specified json as body.
   * @param {string} url URL to send PUT request to.
   * @param {Object} json Data to send.
   */
  put: (url, json) => {
    return request(url, {
      method: "PUT",
      json
    });
  },
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
   * @param {Object} json Data to send.
   */
  putEnergy: (nedUrl, householdAddress, json) => {
    return this.put(`${nedUrl}/energy/${householdAddress}`, json);
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
