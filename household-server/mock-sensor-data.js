module.exports = {
    MockData: createMockData(),
}


function createMockData(samples, min, max) {
    let mockData = []
    for (i = 0; i < samples; i++) {
        let rndm = Math.random()* (max-min) + max
        mockData.append(rndm)
    }
    return mockData
}
