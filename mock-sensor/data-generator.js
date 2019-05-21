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

  getGaussianMockData: (consumption, production, variance = 2) => {
    console.log(production, consumption);
    const gaussian = require("gaussian");
    let mockData = {};
    const produceDistribution = gaussian(production, variance);
    const consumeDistribution = gaussian(consumption, variance);

    // rounding the samples and writing it into the mockData Object
    mockData["produce"] =
      Math.round(produceDistribution.ppf(Math.random()) * 100) / 100;
    mockData["consume"] =
      Math.round(consumeDistribution.ppf(Math.random()) * 100) / 100;
    return mockData;
  }
};
