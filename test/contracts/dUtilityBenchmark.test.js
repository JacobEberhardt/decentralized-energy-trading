const dUtilityBenchmark = artifacts.require("dUtilityBenchmark");
const MockVerifier = artifacts.require("MockContract");
const { expectEvent, shouldFail } = require("openzeppelin-test-helpers");

contract("dUtilityBenchmark", ([owner, household, household2, other]) => {
  let verifier;

  const ENERGY_DELTA_HASH =
    "0xa5b9d60f32436310afebcfda832817a68921beb782fabf7915cc0460b443116a";
  const ZOKRATES_OUT_0 = `0x${ENERGY_DELTA_HASH.substr(2, 32)}`;
  const ZOKRATES_OUT_1 = `0x${ENERGY_DELTA_HASH.substr(34, 32)}`;
  const ZOKRATES_OUT = new Array(8).fill("0");
  ZOKRATES_OUT[0] = ZOKRATES_OUT_0;
  ZOKRATES_OUT[1] = ZOKRATES_OUT_1;

  beforeEach(async () => {
    verifier = await MockVerifier.new();
    this.instance = await dUtilityBenchmark.new({
      from: owner
    });
  });

  describe("#setupBenchmark()", () => {
    it("should revert with length mismatch", async () => {
      await shouldFail.reverting(
        this.instance.setupBenchmark(
          verifier.address,
          [household, household2],
          [ENERGY_DELTA_HASH],
          { from: owner }
        )
      );
    });

    it("should revert when sender is not owner", async () => {
      await shouldFail.reverting(
        this.instance.setupBenchmark(
          verifier.address,
          [household],
          [ENERGY_DELTA_HASH],
          { from: other }
        )
      );
    });

    it("should set up contract for benchmark", async () => {
      const { logs: setupLogs } = await this.instance.setupBenchmark(
        verifier.address,
        [household],
        [ENERGY_DELTA_HASH],
        { from: owner }
      );
      await verifier.givenAnyReturnBool(true);
      const { logs: nettingLogs } = await this.instance.checkNetting(
        [household],
        [0, 1],
        [[2, 3], [4, 5]],
        [6, 7],
        ZOKRATES_OUT
      );
      expectEvent.inLogs(nettingLogs, "NettingSuccess");
      expectEvent.inLogs(setupLogs, "NewHousehold");
      expectEvent.inLogs(setupLogs, "RenewableEnergyChanged");
    });
  });
});
