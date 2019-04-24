module.exports = function() {

    return {
        createMockData: function (samples, min, max) {
            let mockData = [];
            for (i = 0; i < samples; i++) {
                let rndm = Math.random() * (max - min) + min;
                mockData.push(rndm);
            }
            console.log(mockData);
            return this;
        }
    }
}
