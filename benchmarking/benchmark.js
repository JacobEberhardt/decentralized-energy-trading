
let args = process.argv.slice(2);
  
let code;
let code2;
let wE;
let nE;

if(args.length === 2 && args[0] >= 1 && args[1] >= 1){
    wE = Number(args[0]);
    nE = Number(args[1]);

    runBenchmark(wE, nE);

}

function runBenchmark(wE, nE){
    let n = wE + nE;
    genData(wE, nE);
}


function genData(wE, nE){

}

