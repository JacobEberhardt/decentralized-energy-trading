const Utility = require("../../utility-js/Utility");

const expect = require("chai").expect;

describe("Utility", () => {
  const hhAddress = "0x45D4b6e19b3fee56bA93972d8d72aC65FeF26b31";
  beforeEach("add new household", () => {
    Utility.addHousehold(hhAddress);
  });

  describe("Households", () => {
    it("with a new household", () => {
      expect(hhAddress in Utility.households).to.be.true;
    });

    it("is initialized correctly", () => {
      expect(Utility.households[hhAddress].renewableEnergy).to.equal(0);
      expect(Utility.households[hhAddress].nonRenewableEnergy).to.equal(0);
    });

    it("reverts when attempting to add an existing household", () => {
      expect(Utility.addHousehold(hhAddress)).to.be.false;
    });
  });

  describe("Update energy", () => {
    it("updateRenewableEnergy by 100", () => {
      Utility.updateRenewableEnergy(hhAddress, 100);
      expect(Utility.households[hhAddress].renewableEnergy).to.equal(100);
      expect(Utility.renewableEnergy).to.equal(100);
    });

    it("updateNonRenewableEnergy by 100", () => {
      Utility.updateNonRenewableEnergy(hhAddress, 100);
      expect(Utility.households[hhAddress].nonRenewableEnergy).to.equal(100);
      expect(Utility.nonRenewableEnergy).to.equal(100);
    });

    it("reverts when attempting to update energy of not existing household", () => {
      expect(
        Utility._updateEnergy(
          "0x45D4b6e19b3fee56bA93972d8d72aC65FeF26b32",
          100,
          "renewableEnergy"
        )
      ).to.be.false;
    });
  });
});
