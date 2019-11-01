module.exports = {
  /**
   * @param {number} consumption mean of the energy consumption
   * @param {number} production mean of the energy production
   * @returns {{produce: number, consume: number}} mock data within an object
   */
  getGaussianMockData: (consumption, production, variance = 5) => {
    const gaussian = require("gaussian");
    let mockData = {};
    const produceDistribution = gaussian(production, variance);
    const consumeDistribution = gaussian(consumption, variance);

    // Sampling the data from the gaussian distribution and rounding it to two decimals
    let produce =
      Math.round(produceDistribution.ppf(Math.random()) * 100) / 100;
    let consume =
      Math.round(consumeDistribution.ppf(Math.random()) * 100) / 100;
    // Setting all negative values to 0 and writing values to mockData object
    mockData["produce"] = produce < 0 ? 0 : produce;
    mockData["consume"] = consume < 0 ? 0 : consume;
    mockData["meterDelta"] = produce - consume

    return mockData;
  },

  /**
   * Retrieves the regular consume and produce from the sensor-config data based on the energybalance given by the user
   * @returns {{ regularConsumeFactor: number, regularProduceFactor: number }} consume and produce factors
   */
  getEnergyFactor: energyBalance => {
    const {
      regularProductionFactor,
      regularConsumptionFactor
    } = require("./sensor-config");

    if (energyBalance === "+") {
      return {
        regularConsumeFactor: regularConsumptionFactor.pos,
        regularProduceFactor: regularProductionFactor.pos
      };
    }
    if (energyBalance === "=") {
      return {
        regularConsumeFactor: regularConsumptionFactor.eq,
        regularProduceFactor: regularProductionFactor.eq
      };
    }
    if (energyBalance === "-") {
      return {
        regularConsumeFactor: regularConsumptionFactor.neg,
        regularProduceFactor: regularProductionFactor.neg
      };
    }
  }
};
