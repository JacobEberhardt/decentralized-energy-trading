const Utility = artifacts.require("Utility");
const UtilityBase = artifacts.require("UtilityBase");
const UtilityBenchmark = artifacts.require("UtilityBenchmark");

module.exports = function(deployer, network) {
  if (network === "benchmark") {
    deployer.deploy(UtilityBenchmark, 1000, 50, 1000, -2700, { gas: 99999999 });
  } else {
    deployer.deploy(Utility);
    deployer.deploy(UtilityBase);
  }
};
