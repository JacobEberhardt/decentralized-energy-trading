// TESTS:
const fs = require('fs');
// let hs = [{ meterDelta: 200 }, { meterDelta: 400 }]
// let hp = [{ meterDelta: -100 }, {meterDelta: -100}]
// let es = 600;
// let ep = -200;
// // Expected:
// //  prod: 133, 267
// //  cons: 0, 0

// let hs = [{ meterDelta: 100 }, { meterDelta: 100 }]
// let hp = [{ meterDelta: -200 }, { meterDelta: -400 }]
// let es = 200;
// let ep = -600;
// // Expected:
// //  prod: 133, 267
// //  cons: 0, 0

// let hs = [{ meterDelta: 10 }, { meterDelta: 30 }, { meterDelta: 20 }]
// let hp = [{ meterDelta: -75 }, { meterDelta: -15 }]
// let es = 60;
// let ep = -90;
// Expected:
//  prod: 133, 267
//  cons: 0, 0


// let hs = [{ meterDelta: 0 }, { meterDelta: 400 }]
// let hp = [{ meterDelta: -100 }, {meterDelta: -100}]
// let es = 400;
// let ep = 200;
// // // Expected:
// // //  prod: 0, 200
// // //  cons: 0, 0

let hs = [{ meterDelta: 50 }, { meterDelta: 70 }, { meterDelta: 30 }]
let hp = [{ meterDelta: -200}, { meterDelta: -100}, {meterDelta: -25}]
let es = 150;
let ep = -325;
// // Expected:
// //  prod: 0, 200
// //  cons: 0, 0

// let hs = [{ meterDelta: 200 }, { meterDelta: 400 }]
// let hp = [{ meterDelta: -200 }]
// let es = 600;
// let ep = 200;
// // Expected:
// //  prod: 133, 267
// //  cons: 0


// let hs = [{ meterDelta: 127 }, { meterDelta: 31 }]
// let hp = [{ meterDelta: -11 }, {meterDelta: -123}]
// let es = 158;
// let ep = 134;
// // Expected:
// //  prod: 19, 5
// //  cons: 0, 0

// let hs = [{ meterDelta: 11 }, { meterDelta: 123 }]
// let hp = [{ meterDelta: -127 }, { meterDelta: -31 }]
// let es = 134;
// let ep = 158;
// // Expected:
// //  prod: 0, 0
// //  cons: -19, -5

// let hs = [{ meterDelta: 100 }, { meterDelta: 200 }]
// let hp = [{ meterDelta: -200 }, { meterDelta: -200 }]
// let es = 300;
// let ep = 400;
// // Expected:
// //  prod: 0, 0
// //  cons: -50, -50

// let hs = [{ meterDelta: 100 }, { meterDelta: 900 }]
// let hp = [{ meterDelta: -10 }, { meterDelta: -90 }]
// let es = 1000;
// let ep = 100;
// Expected:
//  prod: 90, 810
//  cons: 0, 0

// let hs = [{ meterDelta: 0 }, { meterDelta: 9 }]
// let hp = [{ meterDelta: -10 }, { meterDelta: -90 }]
// let es = 9;
// let ep = 100;
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

// let hs = [{ meterDelta: 93960 }, { meterDelta: 62640}]
// let hp = [{ meterDelta: -156600 }, { meterDelta: -234720 }, { meterDelta: -156600 }, { meterDelta: -156600 }, { meterDelta: -250560 }, { meterDelta: -125280 }, { meterDelta: -187920 }, { meterDelta: -125280}]
// let es = 156600;
// let ep = 1393560;
// // Expected:
// //  prod: 0, 0
// //  cons: -10, -90

// function settle() {
//     console.log(hhFrom)
//     console.log(hhTo);
//     const isMoreAvailableThanDemanded = deltaProducers > deltaConsumers;

//     const factorConsumers = hhTo.map(obj => Math.round((Math.abs(obj.meterDelta) / deltaConsumers) * 10000) / 10000);
//     const energyReference = isMoreAvailableThanDemanded ? deltaProducers : deltaConsumers;

//     for (let i = 0; i < hhFrom.length; i++) {
//         let proportionalFactor = hhFrom[i].meterDelta / energyReference;
//         let shareProducer = Math.round(Math.abs(deltaConsumers) * proportionalFactor);
//         for(let j = 0; j < hhTo.length; j++){
//             let toTransfer = Math.floor(shareProducer * factorConsumers[j])
//             console.log("ShareProducer (", shareProducer, ") * factorConsumers (", factorConsumers[j], ") = Amount => ", toTransfer)
//             transfer(i, j, toTransfer);
//         }
//     }
// }

let writeObject = {}
if(Math.abs(es) < Math.abs(ep)){
    hFrom = hs;
    eFrom = es;
    hTo = hp;
    eTo = ep;
} else {
    hFrom = hp;
    eFrom = ep;
    hTo = hs;
    eTo = es;
}
writeObject['hFrom'] = JSON.parse(JSON.stringify(hFrom))
writeObject["hTo"] = JSON.parse(JSON.stringify(hTo))
function settle(){
    console.log("hFrom:", hFrom)
    console.log("hTo: ", hTo)
    
    let res = [];
    let hh = [];
    for(let i = 0; i < hTo.length; i++){
        eAlloc = Math.round(eFrom * (hTo[i].meterDelta / eTo));
        let hToRes = [];
        for (let j = 0; j < hFrom.length; j++) {
            let obj = {};
            if(eAlloc != 0){
                if(Math.abs(eAlloc) <= Math.abs(hFrom[j].meterDelta)){
                    console.log("Dont split")
                    console.log("eAlloc: ", eAlloc)
                    console.log("hFrom: ", hFrom[j].meterDelta)
                    console.log("hTo: ", hTo[i].meterDelta)
                    obj['from'] = j;
                    obj['to'] = i;
                    obj['amount'] = eAlloc
                    hFrom[j].meterDelta -= eAlloc;
                    hTo[i].meterDelta += eAlloc;
                    eAlloc = 0;
                    console.log("hFrom:", hFrom)
                    console.log("hTo: ", hTo)
                } else {
                    let toTransfer = hFrom[j].meterDelta
                    console.log("Split")
                    console.log("eAlloc: ", toTransfer)
                    console.log("hFrom: ", hFrom[j].meterDelta)
                    console.log("hTo: ", hTo[j].meterDelta)
                    obj['from'] = j;
                    obj['to'] = i;
                    obj['amount'] = toTransfer
                    hFrom[j].meterDelta -= toTransfer;
                    hTo[i].meterDelta += toTransfer;
                    eAlloc -= toTransfer;
                    console.log("hFrom:", hFrom)
                    console.log("hTo: ", hTo)
                }
                hToRes.push(obj);
            }
        }
        res.push(hToRes)

    }

    
    writeObject["deeds"] = res;
    
    console.log(writeObject)
    fs.appendFile('../tmp/res.json', JSON.stringify(writeObject), 'utf8', (err) => {
        if (err) throw err;
    });
}

// function transfer(from, to, amount){
//     hFrom[from].meterDelta -= amount;
//     hTo[to].meterDelta += amount;
// }

settle()


// [   
//     [
//         {from: 0, to: 0, amount: -32 }
//     ],
//     [
//         { from: 0, to: 1, amount: -43 },
//         { from: 1, to: 1, amount: -2 }
//     ],
//     [
//         { from: 0, to: 2, amount: 0 },
//         { from: 1, to: 2, amount: -13 }
//     ]
// ]


// let households = {
//     '0x5feceb66ffc86f38d952786c6d696c79c2dbc239': { meterDelta: 156600, lastUpdate: 1575625777071 },
//     '0x6b86b273ff34fce19d6b804eff5a3f5747ada4ea': { meterDelta: -172080, lastUpdate: 1575625777071 }
// }

// let deltaProducers = 156600;
// let deltaConsumers = -172080;
// let hhFrom = ["0x5feceb66ffc86f38d952786c6d696c79c2dbc239"];
// let hhTo = ["0x6b86b273ff34fce19d6b804eff5a3f5747ada4ea"];


// function settleCleaned(){
//     console.log(households)
//     if (deltaConsumers == 0) return true //No need for netting when nothing has been consumed
//     const isMoreAvailableThanDemanded = deltaProducers > Math.abs(deltaConsumers);
//     console.log(isMoreAvailableThanDemanded)
//     let hFrom;
//     let eFrom;
//     let hTo;
//     let eTo;
//     let eAlloc;
//     if (isMoreAvailableThanDemanded) {
//         hFrom = hhFrom;
//         eFrom = deltaProducers;
//         hTo = hhTo;
//         eTo = deltaConsumers;
//     } else {
//         hFrom = hhTo;
//         eFrom = deltaConsumers;
//         hTo = hhFrom;
//         eTo = deltaProducers;
//     }

//     console.log("deltaProd: ", deltaProducers);
//     console.log("deltaCon: ", deltaConsumers);
//     console.log("hFrom: ", hFrom);
//     console.log("hTo: ", hTo )

//     for (let i = 0; i < hTo.length; i++) {
//         eAlloc = Math.round(eFrom * (households[hTo[i]].meterDelta / eTo));
//         console.log(eAlloc)
//         for (let j = 0; j < hFrom.length; j++) {
//             if (eAlloc != 0) {
//                 if (Math.abs(eAlloc) <= Math.abs(households[hFrom[j]].meterDelta)) {
//                     transfer(hFrom[j], hTo[i], eAlloc)
//                     eAlloc = 0;
//                 } else {
//                     let toTransfer = households[hFrom[j]].meterDelta
//                     transfer(hFrom[j], hTo[i], toTransfer, isMoreAvailableThanDemanded)
//                     // this._addDeed(hFrom[j], hTo[i], toTransfer, isMoreAvailableThanDemanded)
//                     eAlloc -= toTransfer;
//                 }
//             }
//         }
//     }
//     console.log(households)
//     return true;
// }

// let res = [];
// for (let i = 0; i < hTo.length; i++) {
//     eAlloc = Math.round(eFrom * (hTo[i].meterDelta / eTo));
//     let hToRes = [];
//     for (let j = 0; j < hFrom.length; j++) {
//         let obj = {};
//         if (eAlloc != 0) {
//             if (Math.abs(eAlloc) <= Math.abs(hFrom[j].meterDelta)) {
//                 hFrom[j].meterDelta -= eAlloc;
//                 hTo[i].meterDelta += eAlloc;
//                 eAlloc = 0;
//             } else {
//                 let toTransfer = hFrom[j].meterDelta
//                 hFrom[j].meterDelta -= toTransfer;
//                 hTo[i].meterDelta += toTransfer;
//                 eAlloc -= toTransfer;
//             }
//             hToRes.push(obj);
//         }
//     }
//     res.push(hToRes)

// }

function transfer(from, to, amount){
    console.log(amount)
    households[from].meterDelta -= amount;
    households[to].meterDelta += amount;
}

// settleCleaned()