// TESTS:

// let hhFrom = [{ meterDelta: 200 }, { meterDelta: 400 }]
// let hhTo = [{ meterDelta: -130 }, {meterDelta: -270}]
// let deltaProducers = 600;
// let deltaConsumers = 400;
// Expected:
//  prod: 67, 133
//  cons: 0, 0

// let hhFrom = [{ meterDelta: 100 }, { meterDelta: 200 }]
// let hhTo = [{ meterDelta: -200 }, { meterDelta: -200 }]
// let deltaProducers = 300;
// let deltaConsumers = 400;
// // Expected:
// //  prod: 0, 0
// //  cons: -50, -50

// let hhFrom = [{ meterDelta: 100 }, { meterDelta: 900 }]
// let hhTo = [{ meterDelta: -10 }, { meterDelta: -90 }]
// let deltaProducers = 1000;
// let deltaConsumers = 100;
// Expected:
//  prod: 90, 810
//  cons: 0, 0

// let hhFrom = [{ meterDelta: 0 }, { meterDelta: 9 }]
// let hhTo = [{ meterDelta: -10 }, { meterDelta: -90 }]
// let deltaProducers = 9;
// let deltaConsumers = 100;
// Expected:
//  prod: 0, 0
//  cons: -9, -82

// { meterDelta: 0, lastUpdate: 1574865636383 },
// '0x5feceb66ffc86f38d952786c6d696c79c2dbc239': { meterDelta: 93960, lastUpdate: 1574865636361 },
// '0x6b86b273ff34fce19d6b804eff5a3f5747ada4ea': { meterDelta: 62640, lastUpdate: 1574865636361 },
// '0xd4735e3a265e16eee03f59718b9b5d03019c07d8': { meterDelta: -156600, lastUpdate: 1574865636361 },
// '0x4e07408562bedb8b60ce05c1decfe3ad16b72230': { meterDelta: -234720, lastUpdate: 1574865636361 },
// '0x4b227777d4dd1fc61c6f884f48641d02b4d121d3': { meterDelta: -156600, lastUpdate: 1574865636361 },
// '0xef2d127de37b942baad06145e54b0c619a1f2232': { meterDelta: -156600, lastUpdate: 1574865636361 },
// '0xe7f6c011776e8db7cd330b54174fd76f7d0216b6': { meterDelta: -250560, lastUpdate: 1574865636361 },
// '0x7902699be42c8a8e46fbbb4501726517e86b22c5': { meterDelta: -125280, lastUpdate: 1574865636361 },
// '0x2c624232cdd221771294dfbb310aca000a0df6ac': { meterDelta: -187920, lastUpdate: 1574865636361 },
// '0x19581e27de7ced00ff1ce50b2047e7a567c76b1c': { meterDelta: -125280, lastUpdate: 1574865636361 } },

let hhFrom = [{ meterDelta: 93960 }, { meterDelta: 62640}]
let hhTo = [{ meterDelta: -156600 }, { meterDelta: -234720 }, { meterDelta: -156600 }, { meterDelta: -156600 }, { meterDelta: -250560 }, { meterDelta: -125280 }, { meterDelta: -187920 }, { meterDelta: -125280}]
let deltaProducers = 156600;
let deltaConsumers = 1393560;
// // Expected:
// //  prod: 0, 0
// //  cons: -10, -90

function settle() {
    console.log(hhFrom)
    console.log(hhTo);
    const isMoreAvailableThanDemanded = deltaProducers > deltaConsumers;

    const factorConsumers = hhTo.map(obj => Math.round((Math.abs(obj.meterDelta) / deltaConsumers) * 10000) / 10000);
    const energyReference = isMoreAvailableThanDemanded ? deltaProducers : deltaConsumers;

    for (let i = 0; i < hhFrom.length; i++) {
        let proportionalFactor = hhFrom[i].meterDelta / energyReference;
        let shareProducer = Math.round(Math.abs(deltaConsumers) * proportionalFactor);
        for(let j = 0; j < hhTo.length; j++){
            let toTransfer = Math.floor(shareProducer * factorConsumers[j])
            console.log("ShareProducer (", shareProducer, ") * factorConsumers (", factorConsumers[j], ") = Amount => ", toTransfer)
            transfer(i, j, toTransfer);
        }
    }
}

function transfer(from, to, amount){
    hhFrom[from].meterDelta -= amount;
    hhTo[to].meterDelta += amount;
    console.log(hhFrom)
    console.log(hhTo);

}

settle()