module.exports = function(samples, min, max) {

    function createMockData() {
        let mockData = [];
        for (i = 0; i < samples; i++) {
            let rndm = Math.random() * (max - min) + min;
            mockData.push(rndm);
        }
        console.log(mockData);
    }
    return {
        createMockData: createMockData
    }
}
