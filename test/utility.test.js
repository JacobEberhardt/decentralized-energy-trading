/* eslint-disable no-unused-vars */
/* eslint-disable no-unused-expressions */
const Utility = artifacts.require("Utility");
const { BN, constants, shouldFail } = require("openzeppelin-test-helpers");
const expect = require("chai").use(require("chai-bn")(BN)).expect;

contract("Utility", async ([owner, household]) => {
  beforeEach(async () => {
    this.instance = await Utility.new({
      from: owner
    });
  });

  describe("Households", async () => {
    it("should add a new household, if it does not exist yet", async () => {
      await this.instance.addHousehold(household);

      let hh = await this.instance.getHousehold(household);

      expect(hh[0]).to.be.true; // initialized
      expect(hh[1]).to.be.bignumber.that.is.zero; // renewableEnergy
      expect(hh[2]).to.bignumber.that.is.zero; // nonRenewableEnergy
    });

    it("should revert when household exists", async () => {
      await this.instance.addHousehold(household);
      await shouldFail.reverting(this.instance.addHousehold(household));
    });
  });

  describe("Record energy production/consumption", async () => {
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
