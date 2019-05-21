module.exports = {
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

  getGaussianMockData: (samples, mean, variance) => {
    const gaussian = require("gaussian");
    let mockData = {};
    var distribution = gaussian(mean, variance);
    for (let i = 0; i < samples; i++) {
      let rndm = distribution.ppf(Math.random());
      // rounding the samples
      rndm = Math.round(rndm * 100) / 100;
      mockData[i] = rndm;
    }
    return mockData;
  }
};
