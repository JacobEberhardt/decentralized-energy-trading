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

contract("Utility", ([owner, household, other]) => {
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

        expect(hh[0]).to.be.true; // initialized
        expect(hh[1]).to.be.bignumber.that.is.zero; // renewableEnergy
        expect(hh[2]).to.be.bignumber.that.is.zero; // nonRenewableEnergy
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

  describe("Record household energy production/consumption", () => {
    beforeEach(async () => {
      await this.instance.addHousehold(household); // Add dummy household
    });

    context("Renewable energy", async () => {
      it("should record the net amount of energy produced correctly", async () => {
        await this.instance.updateRenewableEnergy(household, 10, 5, {
          from: household
        });
        let netRenewableEnergy = await this.instance.balanceOfRenewableEnergy(
          household
        );
        expect(netRenewableEnergy).to.be.bignumber.equal("5");
      });
    });

    context("Non-renewable energy", async () => {
      it("should record the net amount of energy produced correctly", async () => {
        await this.instance.updateNonRenewableEnergy(household, 10, 5, {
          from: household
        });
        let netNonRenewableEnergy = await this.instance.balanceOfNonRenewableEnergy(
          household
        );
        expect(netNonRenewableEnergy).to.be.bignumber.equal("5");
      });
    });

    it("should revert, onlyHousehold required", async () => {
      await shouldFail.reverting(
        this.instance.updateRenewableEnergy(household, 0, 0, {
          from: other
        })
      );
    });

    it("should revert, householdExists required", async () => {
      await shouldFail.reverting(
        this.instance.updateRenewableEnergy(other, 0, 0, {
          from: other
        })
      );
    });

    it("should revert on overflow", async () => {
      await shouldFail.reverting(
        this.instance.updateRenewableEnergy(household, 0, constants.MAX_UINT256)
      );
    });

    it("should revert on negative _producedEnergy value", async () => {
      await shouldFail.reverting(
        this.instance.updateRenewableEnergy(household, -10, 10)
      );
    });

    it("should revert on negative _consumedEnergy value", async () => {
      await shouldFail.reverting(
        this.instance.updateRenewableEnergy(household, 10, -10)
      );
    });
  });

  describe("Record total energy production/consumption", () => {
    beforeEach(async () => {
      await this.instance.addHousehold(household); // Add dummy household
    });

    context("Total renewable energy", async () => {
      it("should record the net amount of total energy produced correctly", async () => {
        await this.instance.updateRenewableEnergy(household, 10, 5, {
          from: household
        });
        let totalRenewableEnergy = await this.instance.totalRenewableEnergy();
        expect(totalRenewableEnergy).to.be.bignumber.equal("5");
      });
    });

    context("Total non-renewable energy", async () => {
      it("should record the net amount of total energy produced correctly", async () => {
        await this.instance.updateNonRenewableEnergy(household, 10, 5, {
          from: household
        });
        let totalNonRenewableEnergy = await this.instance.totalNonRenewableEnergy();
        expect(totalNonRenewableEnergy).to.be.bignumber.equal("5");
      });
    });

    context("Total energy", async () => {
      it("should record the net amount of total energy produced correctly", async () => {
        await this.instance.updateNonRenewableEnergy(household, 10, 5, {
          from: household
        });
        await this.instance.updateRenewableEnergy(household, 10, 5, {
          from: household
        });
        let totalEnergy = await this.instance.totalEnergy();
        expect(totalEnergy).to.be.bignumber.equal("10");
      });
    });
  });
});
