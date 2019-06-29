/* eslint-disable no-unused-vars */
/* eslint-disable no-unused-expressions */
const UtilityBase = artifacts.require("dUtility");
const {
  BN,
  constants,
  expectEvent,
  shouldFail
} = require("openzeppelin-test-helpers");
const expect = require("chai").use(require("chai-bn")(BN)).expect;

contract("UtilityBase", ([owner, household, household2, other]) => {
  const ZERO_HASH =
    "0x0000000000000000000000000000000000000000000000000000000000000000";
  beforeEach(async () => {
    this.instance = await UtilityBase.new({
      from: owner
    });
  });

  describe("Households", () => {
    it("should create a new household", async () => {
      await this.instance.addHousehold(household, {
        from: owner
      });
      const hh = await this.instance.getHousehold(household, {
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
        const hh = await this.instance.getHousehold(household2, {
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
        this.instance.updateRenewableEnergy(household, energyHash, {
          from: household2
        })
      );
    });

    it("should set the renewable energy hash to " + energyHash, async () => {
      await this.instance.updateRenewableEnergy(household, energyHash, {
        from: household
      });
      const hh = await this.instance.getHousehold(household, {
        from: household
      });
      expect(hh[0]).to.be.true; // initialized
      expect(hh[1]).to.be.equal(energyHash); // renewableEnergy
      expect(hh[2]).to.be.equal(ZERO_HASH); // nonRenewableEnergy
    });

    it(
      "should set the non-renewable energy hash to " + energyHash,
      async () => {
        await this.instance.updateNonRenewableEnergy(household, energyHash, {
          from: household
        });
        const hh = await this.instance.getHousehold(household, {
          from: household
        });
        expect(hh[0]).to.be.true; // initialized
        expect(hh[1]).to.be.equal(ZERO_HASH); // renewableEnergy
        expect(hh[2]).to.be.equal(energyHash); // nonRenewableEnergy
      }
    );
  });
});
