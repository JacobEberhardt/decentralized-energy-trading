module.exports = {
  /**
   * This function draws random samples from an uniform distribution.
   * @param {Number} samples Amount of Samples to draw from the random distribution
   * @param {Number} min Minimum value of the random distribution
   * @param {Number} max Maximum value of the random distribution
   * @returns {Object} mock data within an object
   */

  getUniformMockData: (samples, min, max) => {
    let mockData = {};
    for (let i = 0; i < samples; i++) {
      let rndm = Math.random() * (max - min) + min;
      // rounding the samples
      rndm = Math.round(rndm * 100) / 100;
      mockData[i] = rndm;
    }
    return mockData;
  },

  /**
   * @param {Number} consumption mean of the energy consumption
   * @param {Number} production mean of the energy production
   * @returns {Object} mock data within an object
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

    return mockData;
  },

  /**
   * Retrieves the regular consume and produce from the sensor-config data based on the energybalance given by the user
   * @returns {Object<Number>} consume and produce factors
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
