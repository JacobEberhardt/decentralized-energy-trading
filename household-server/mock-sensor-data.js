module.exports = {
    /**
     * This function draws random samples from an uniform distribution.
     * @param {uint} samples amount of samples
     * @param {int} min min value of samples
     * @param {int} max max value of samples (included)
     * @return {list} List of samples with the length of samples
     */
        createMockData: function (samples, min, max) {
            let mockData = [];
            for (i = 0; i < samples; i++) {
                let rndm = Math.random() * (max - min) + min 
                // rounding the samples
                rndm = Math.round(rndm * 100) / 100 
                mockData.push(rndm);
            }
            return mockData;
        
    }
}
