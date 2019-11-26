console.log("REACHED")
if (args.length === 2 && args[0] >= 1 && args[1] >= 1) {
    wE = Number(args[0]);
    nE = Number(args[1]);

    runBenchmark(wE, nE);

}