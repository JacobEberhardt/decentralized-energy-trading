const root = process.env.PROJECT_ROOT;
const web3Helper = require(`${root}/helpers/web3`);
const contractData = require(`${root}/build/contracts/UtilityBenchmark.json`);
const web3 = web3Helper.initWeb3("authority");
const { address, password } = require(`${root}/household-server-config`);

var data = [];
const createCsvWriter = require("csv-writer").createObjectCsvWriter;

async function generateCsv() {
  console.log("Generating CSV file ...");
  const csvWriter = createCsvWriter({
    path: "utility_benchmark.csv",
    header: [
      { id: "households", title: "Nr. of Households" },
      { id: "gas", title: "Estimated Gas" },
      { id: "time", title: "Estimation Time (ms)" }
    ]
  });
  await csvWriter.writeRecords(data);
  console.log("CSV file was generated successfully!");
}

async function utilityBenchmark(households, maxHouseholds) {
  console.log("Starting Utility Benchmark ...");

  while (households < maxHouseholds) {
    console.log(
      `Deploying UtilityBenchmark Contract for ${households} Households ...`
    );

    await web3.eth.personal.unlockAccount(address, password, null);
    const contract = new web3.eth.Contract(contractData.abi);
    const deployedContract = await contract
      .deploy({
        data: contractData.bytecode,
        arguments: [households, households, 100, -100]
      })
      .send({
        from: address,
        gas: 5000000000,
        gasPrice: "300000000000"
      })
      .catch(err => console.log(err));

    console.log(
      "UtilityBenchmark Contract Address: " + deployedContract.options.address
    );
    var start = new Date();
    await deployedContract.methods
      .settle()
      .estimateGas({ gas: 5000000000 }, function(error, gasAmount) {
        if (error) {
          throw error;
        }
        console.log(`Gas: ${gasAmount}`);
        var end = new Date();
        data.push({
          households: households,
          gas: gasAmount,
          time: end - start
        });
      });
    households = households + 10;
  }
  await generateCsv();
  console.log("Utility Benchmark completed!");
  web3.currentProvider.connection.close();
}

utilityBenchmark(10, 100);
