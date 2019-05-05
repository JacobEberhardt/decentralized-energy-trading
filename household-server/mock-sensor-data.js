module.exports = {
  /**
   * This function draws random samples from an uniform distribution.
   * @param {number} samples amount of samples
   * @param {number} min min value of samples
   * @param {number} max max value of samples (included)
   * @return {Array} List of samples with the length of samples
   */
  createMockData: (samples, min, max) => {
    let mockData = [];
    for (let i = 0; i < samples; i++) {
      let rndm = Math.random() * (max - min) + min;
      // rounding the samples
      rndm = Math.round(rndm * 100) / 100;
      mockData.push(rndm);
    }
    return mockData;
  }
};
