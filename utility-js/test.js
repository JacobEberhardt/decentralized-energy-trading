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

// let hhFrom = [{ meterDelta: 0 }, { meterDelta: 0 }]
// let hhTo = [{ meterDelta: -10 }, { meterDelta: -90 }]
// let deltaProducers = 0;
// let deltaConsumers = 100;
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
            let toTransfer = Math.round(shareProducer * factorConsumers[j])
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