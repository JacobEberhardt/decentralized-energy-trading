/* eslint-disable no-unused-vars */
/* eslint-disable no-unused-expressions */
const FifsUtility = artifacts.require("FifsUtility");
const {
  BN,
  constants,
  expectEvent,
  shouldFail
} = require("openzeppelin-test-helpers");
const expect = require("chai").use(require("chai-bn")(BN)).expect;

contract("FifsUtility", ([owner, household, other]) => {
  beforeEach(async () => {
    this.instance = await FifsUtility.new({
      from: owner
    });
  });

  describe("Checkpoint", () => {
    it("should be initialized with 0", async () => {
      expect(await this.instance.checkpoint()).to.be.bignumber.that.is.zero;
    });
  });

  describe("Households", () => {
    context("with a new household", async () => {
      beforeEach(async () => {
        ({ logs: this.logs } = await this.instance.addHousehold(household));
      });

      it("should create a new household", async () => {
        const hh = await this.instance.getHousehold(household);

        expect(hh[0]).to.be.true; // initialized
        expect(hh[1]).to.be.bignumber.that.is.zero; // renewableEnergy
        expect(hh[2]).to.be.bignumber.that.is.zero; // nonRenewableEnergy
      });

      it("should store addresses in householdList", async () => {
        expect((await this.instance.householdList(0)) == household);

        await this.instance.addHousehold(other);
        expect((await this.instance.householdList(1)) == other);
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
});
