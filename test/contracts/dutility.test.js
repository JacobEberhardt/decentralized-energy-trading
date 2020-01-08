/* eslint-disable no-unused-vars */
/* eslint-disable no-unused-expressions */
const sha256 = require("js-sha256");
const dUtility = artifacts.require("dUtility");
const MockVerifier = artifacts.require("MockContract");
const {
  BN,
  constants,
  expectEvent,
  shouldFail
} = require("openzeppelin-test-helpers");
const expect = require("chai").use(require("chai-bn")(BN)).expect;

contract("dUtility", ([owner, household, household2, other]) => {
  const ZERO_HASH =
    "0x0000000000000000000000000000000000000000000000000000000000000000";
  let verifier = null;
  beforeEach(async () => {
    verifier = await MockVerifier.new();
    this.instance = await dUtility.new({
      from: owner
    });
    await this.instance.setVerifier(verifier.address, { from: owner });
  });

  describe("Households", () => {
    it("should create another new household", async () => {
      await this.instance.addHousehold(household, {
        from: owner
      });
      const hh = await this.instance.getHousehold(42, household, {
        from: household
      });
      expect(hh[0]).to.be.true; // initialized
      expect(hh[1]).to.be.equal(ZERO_HASH); // renewableEnergy
      expect(hh[2]).to.be.equal(ZERO_HASH); // nonRenewableEnergy
    });

    it("should throw when sender is not owner", async () => {
      await shouldFail.reverting(
        this.instance.addHousehold(household, {
          from: other
        })
      );
    });
    context("with a new household", async () => {
      beforeEach(async () => {
        ({ logs: this.logs } = await this.instance.addHousehold(household2, {
          from: owner
        }));
      });

      it("should create a new household", async () => {
        const hh = await this.instance.getHousehold(42, household2, {
          from: household2
        });
        expect(hh[0]).to.be.true; // initialized
        expect(hh[1]).to.be.equal(ZERO_HASH); // renewableEnergy
        expect(hh[2]).to.be.equal(ZERO_HASH); // nonRenewableEnergy
      });

      it("emits event NewHousehold", async () => {
        expectEvent.inLogs(this.logs, "NewHousehold", {
          household: household2
        });
      });

      it("reverts when attempting to add an existing household", async () => {
        await shouldFail.reverting(
          this.instance.addHousehold(household2, {
            from: owner
          })
        );
      });
    });
  });

  describe("Energy tracking", () => {
    // Some dummy energy hash to be used as input for the energy methods.
    const energyHash =
      "0xa5b9d60f32436310afebcfda832817a68921beb782fabf7915cc0460b443116a";

    beforeEach(async () => {
      await this.instance.addHousehold(household, {
        from: owner
      }); // Add dummy household
    });

    it("should throw when sender is not household owner", async () => {
      await shouldFail.reverting(
        this.instance.updateRenewableEnergy(42, household, energyHash, {
          from: household2
        })
      );
    });

    it("should set the renewable energy hash to " + energyHash, async () => {
      await this.instance.updateRenewableEnergy(42, household, energyHash, {
        from: household
      });
      const hh = await this.instance.getHousehold(42, household, {
        from: household
      });
      expect(hh[0]).to.be.true; // initialized
      expect(hh[1]).to.be.equal(energyHash); // renewableEnergy
      expect(hh[2]).to.be.equal(ZERO_HASH); // nonRenewableEnergy
    });

    it(
      "should set the non-renewable energy hash to " + energyHash,
      async () => {
        await this.instance.updateNonRenewableEnergy(42, household, energyHash, {
          from: household
        });
        const hh = await this.instance.getHousehold(42, household, {
          from: household
        });
        expect(hh[0]).to.be.true; // initialized
        expect(hh[1]).to.be.equal(ZERO_HASH); // renewableEnergy
        expect(hh[2]).to.be.equal(energyHash); // nonRenewableEnergy
      }
    );
  });

  describe("Netting verification", () => {
    const NETTING_SUCCESS = "NettingSuccess";
    const ENERGY_DELTA_HASH =
      "0xa5b9d60f32436310afebcfda832817a68921beb782fabf7915cc0460b443116a";
    const ZOKRATES_OUT_0 = `0x${ENERGY_DELTA_HASH.substr(2, 32)}`;
    const ZOKRATES_OUT_1 = `0x${ENERGY_DELTA_HASH.substr(34, 32)}`;
    const ZOKRATES_OUT = new Array(8).fill("0");
    ZOKRATES_OUT[0] = ZOKRATES_OUT_0;
    ZOKRATES_OUT[1] = ZOKRATES_OUT_1;

    beforeEach(async () => {
      await this.instance.addHousehold(household, {
        from: owner
      });
      await this.instance.updateRenewableEnergy(42, household, ENERGY_DELTA_HASH, {
        from: household
      });
    });

    it(`should revert with "Household energy hash mismatch."`, async () => {
      await this.instance.updateRenewableEnergy(42,
        household,
        `0x${sha256("wrongDelta")}`,
        {
          from: household
        }
      );
      const zokratesOutput = new Array(8).fill(0);
      zokratesOutput[0] = ZOKRATES_OUT_0;
      await shouldFail.reverting(
        this.instance.checkNetting(
          42,
          [household],
          [0, 1],
          [[2, 3], [4, 5]],
          [6, 7],
          ZOKRATES_OUT
        )
      );
    });

    it(`should emit ${NETTING_SUCCESS} event`, async () => {
      await verifier.givenAnyReturnBool(true);
      ({ logs: this.logs } = await this.instance.checkNetting(
        42,
        [household],
        [0, 1],
        [[2, 3], [4, 5]],
        [6, 7],
        ZOKRATES_OUT
      ));
      expectEvent.inLogs(this.logs, NETTING_SUCCESS);
    });
  });
});
