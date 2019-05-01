/* eslint-disable no-unused-vars */
/* eslint-disable no-unused-expressions */
const Utility = artifacts.require("Utility");
const {
  BN,
  constants,
  expectEvent,
  shouldFail
} = require("openzeppelin-test-helpers");
const expect = require("chai").use(require("chai-bn")(BN)).expect;

contract("Utility", ([owner, household]) => {
  beforeEach(async () => {
    this.instance = await Utility.new({
      from: owner
    });
  });

  describe("Households", () => {
    context("with a new household", async () => {
      beforeEach(async () => {
        ({ logs: this.logs } = await this.instance.addHousehold(household));
      });

      it("should create a new household", async () => {
        let hh = await this.instance.getHousehold(household);

        expect(hh[0]).to.be.true; // Initialized
        expect(hh[1]).to.be.bignumber.that.is.zero; // renewableEnergy
        expect(hh[2]).to.bignumber.that.is.zero; // nonRenewableEnergy
      });

      it("emits event NewHousehold", async () => {
        expectEvent.inLogs(this.logs, "NewHousehold", {
          household: household
        });
      });

      it("reverts when attempting to add an existing household", async () => {
        await shouldFail.reverting(this.instance.addHousehold(household));
      });
    });
  });

  describe("Record energy production/consumption", () => {
    beforeEach(async () => {
      await this.instance.addHousehold(household); // Add dummy household
    });

    it("should record the net amount of energy produced correctly", async () => {
      await this.instance.updateEnergy(household, 10, 5, { from: household });
      let netEnergy = await this.instance.balanceOfRenewableEnergy(household);
      expect(netEnergy).to.be.bignumber.equal("5");
    });

    it("should revert on overflow", async () => {
      await shouldFail.reverting(
        this.instance.updateEnergy(household, 0, constants.MAX_UINT256)
      );
    });
  });
});
