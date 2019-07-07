/* eslint-disable no-unused-vars */
/* eslint-disable no-unused-expressions */
const Utility = require("../../utility-js/Utility");

const expect = require("chai").expect;

const RENEWABLE_ENERGY = "renewableEnergy";
const NONRENEWABLE_ENERGY = "nonRenewableEnergy";

const hhAddress1 = "0x45D4b6e19b3fee56bA93972d8d72aC65FeF26b01";
const hhAddress2 = "0x45D4b6e19b3fee56bA93972d8d72aC65FeF26b02";
const hhAddress3 = "0x45D4b6e19b3fee56bA93972d8d72aC65FeF26b03";
const hhAddress4 = "0x45D4b6e19b3fee56bA93972d8d72aC65FeF26b04";

describe("Utility", () => {
  let instance;
  beforeEach(() => {
    instance = new Utility();
  });

  context("Households", () => {
    beforeEach("add new household", () => {
      instance.addHousehold(hhAddress1);
    });

    describe("household", () => {
      it("is created", () => {
        expect(hhAddress1 in instance.households).to.be.true;
      });

      it("is initialized correctly", () => {
        expect(instance.households[hhAddress1][RENEWABLE_ENERGY]).to.equal(0);
        expect(instance.households[hhAddress1][NONRENEWABLE_ENERGY]).to.equal(
          0
        );
      });

      it("reverts when attempting to add an existing household", () => {
        expect(instance.addHousehold(hhAddress1)).to.be.false;
      });
    });

    describe("update meter reading", () => {
      it("updateMeterReading by 100", () => {
        instance.updateMeterReading(hhAddress1, 100, Date.now());
        expect(instance.households[hhAddress1].meterReading).to.equal(100);
        expect(instance.households[hhAddress1][RENEWABLE_ENERGY]).to.equal(100);
        expect(instance[RENEWABLE_ENERGY]).to.equal(100);
      });

      it("reverts when attempting to update meter reading of not existing household", () => {
        expect(
          instance._updateEnergy(
            "0x45D4b6e19b3fee56bA93972d8d72aC65FeF26b00",
            100,
            RENEWABLE_ENERGY
          )
        ).to.be.false;
      });
    });

    describe("update energy", () => {
      it("updateRenewableEnergy by 100", () => {
        instance.updateRenewableEnergy(hhAddress1, 100);
        expect(instance.households[hhAddress1][RENEWABLE_ENERGY]).to.equal(100);
        expect(instance[RENEWABLE_ENERGY]).to.equal(100);
      });

      it("updateNonRenewableEnergy by 100", () => {
        instance.updateNonRenewableEnergy(hhAddress1, 100);
        expect(instance.households[hhAddress1][NONRENEWABLE_ENERGY]).to.equal(
          100
        );
        expect(instance[NONRENEWABLE_ENERGY]).to.equal(100);
      });

      it("reverts when attempting to update energy of not existing household", () => {
        expect(
          instance._updateEnergy(
            "0x45D4b6e19b3fee56bA93972d8d72aC65FeF26b00",
            100,
            RENEWABLE_ENERGY
          )
        ).to.be.false;
      });
    });
  });

  context("Settlement", () => {
    beforeEach("with 4 households", () => {
      instance.addHousehold(hhAddress1);
      instance.addHousehold(hhAddress2);
      instance.addHousehold(hhAddress3);
      instance.addHousehold(hhAddress4);
    });

    describe("totalRenewableEnergy = 0", () => {
      it("availableRenewableEnergy = 200, neededRenewableEnergy = -200; households do not need to split energy", () => {
        instance.updateRenewableEnergy(hhAddress1, 100);
        instance.updateRenewableEnergy(hhAddress2, 100);
        instance.updateRenewableEnergy(hhAddress3, -100);
        instance.updateRenewableEnergy(hhAddress4, -100);

        instance.settle();

        expect(instance.households[hhAddress1][RENEWABLE_ENERGY]).to.equal(0);
        expect(instance.households[hhAddress2][RENEWABLE_ENERGY]).to.equal(0);
        expect(instance.households[hhAddress3][RENEWABLE_ENERGY]).to.equal(0);
        expect(instance.households[hhAddress4][RENEWABLE_ENERGY]).to.equal(0);
      });

      it("availableRenewableEnergy = 200, neededRenewableEnergy = -200; households need to split energy", () => {
        instance.updateRenewableEnergy(hhAddress1, 40);
        instance.updateRenewableEnergy(hhAddress2, 160);
        instance.updateRenewableEnergy(hhAddress3, -160);
        instance.updateRenewableEnergy(hhAddress4, -40);

        instance.settle();

        expect(instance.households[hhAddress1][RENEWABLE_ENERGY]).to.equal(0);
        expect(instance.households[hhAddress2][RENEWABLE_ENERGY]).to.equal(0);
        expect(instance.households[hhAddress3][RENEWABLE_ENERGY]).to.equal(0);
        expect(instance.households[hhAddress4][RENEWABLE_ENERGY]).to.equal(0);
      });
    });

    describe("totalRenewableEnergy > 0", () => {
      it("availableRenewableEnergy = 400, neededRenewableEnergy = -200; households need to split energy", async () => {
        instance.updateRenewableEnergy(hhAddress1, 200);
        instance.updateRenewableEnergy(hhAddress2, 200);
        instance.updateRenewableEnergy(hhAddress3, -100);
        instance.updateRenewableEnergy(hhAddress4, -100);

        instance.settle();

        expect(instance.households[hhAddress1][RENEWABLE_ENERGY]).to.equal(100);
        expect(instance.households[hhAddress2][RENEWABLE_ENERGY]).to.equal(100);
        expect(instance.households[hhAddress3][RENEWABLE_ENERGY]).to.equal(0);
        expect(instance.households[hhAddress4][RENEWABLE_ENERGY]).to.equal(0);
      });

      it("availableRenewableEnergy = 300, neededRenewableEnergy = -200; households need to split energy; rounded values therefore FIFS", async () => {
        instance.updateRenewableEnergy(hhAddress1, 200);
        instance.updateRenewableEnergy(hhAddress2, 100);
        instance.updateRenewableEnergy(hhAddress3, -100);
        instance.updateRenewableEnergy(hhAddress4, -100);

        instance.settle();

        expect(instance.households[hhAddress1][RENEWABLE_ENERGY]).to.equal(67);
        expect(instance.households[hhAddress2][RENEWABLE_ENERGY]).to.equal(33);
        expect(instance.households[hhAddress3][RENEWABLE_ENERGY]).to.equal(0);
        expect(instance.households[hhAddress4][RENEWABLE_ENERGY]).to.equal(0);
      });
    });

    describe("totalRenewableEnergy < 0", () => {
      it("availableRenewableEnergy = 200, neededRenewableEnergy = -400; households need to split energy", async () => {
        instance.updateRenewableEnergy(hhAddress1, 100);
        instance.updateRenewableEnergy(hhAddress2, 100);
        instance.updateRenewableEnergy(hhAddress3, -200);
        instance.updateRenewableEnergy(hhAddress4, -200);

        instance.settle();

        expect(instance.households[hhAddress1][RENEWABLE_ENERGY]).to.equal(0);
        expect(instance.households[hhAddress2][RENEWABLE_ENERGY]).to.equal(0);
        expect(instance.households[hhAddress3][RENEWABLE_ENERGY]).to.equal(
          -100
        );
        expect(instance.households[hhAddress4][RENEWABLE_ENERGY]).to.equal(
          -100
        );
      });

      it("availableRenewableEnergy = 200, neededRenewableEnergy = -300; households need to split energy, round values therefore FIFS", async () => {
        instance.updateRenewableEnergy(hhAddress1, 100);
        instance.updateRenewableEnergy(hhAddress2, 100);
        instance.updateRenewableEnergy(hhAddress3, -200);
        instance.updateRenewableEnergy(hhAddress4, -100);

        instance.settle();

        expect(instance.households[hhAddress1][RENEWABLE_ENERGY]).to.equal(0);
        expect(instance.households[hhAddress2][RENEWABLE_ENERGY]).to.equal(0);
        expect(instance.households[hhAddress3][RENEWABLE_ENERGY]).to.equal(-67);
        expect(instance.households[hhAddress4][RENEWABLE_ENERGY]).to.equal(-33);
      });
    });
  });

  context("Transfer energy", () => {
    beforeEach(
      "with 2 household; hh1 renewableEnergy is 100, hh2 is 0; hh2 nonRenewableEnergy is 100, hh1 is 0",
      () => {
        instance.addHousehold(hhAddress1);
        instance.addHousehold(hhAddress2);

        instance.updateRenewableEnergy(hhAddress1, 100);
        instance.updateNonRenewableEnergy(hhAddress2, 100);
      }
    );

    describe("transfer ", () => {
      it("100 renewableEnergy from hh1 to hh2", () => {
        expect(instance.households[hhAddress1][RENEWABLE_ENERGY]).to.equal(100);
        expect(instance.households[hhAddress2][RENEWABLE_ENERGY]).to.equal(0);

        instance._transfer(hhAddress1, hhAddress2, 100, RENEWABLE_ENERGY);

        expect(instance.households[hhAddress1][RENEWABLE_ENERGY]).to.equal(0);
        expect(instance.households[hhAddress2][RENEWABLE_ENERGY]).to.equal(100);
      });

      it("100 nonRenewableEnergy from hh2 to hh1", () => {
        expect(instance.households[hhAddress1][NONRENEWABLE_ENERGY]).to.equal(
          0
        );
        expect(instance.households[hhAddress2][NONRENEWABLE_ENERGY]).to.equal(
          100
        );

        instance._transfer(hhAddress2, hhAddress1, 100, NONRENEWABLE_ENERGY);

        expect(instance.households[hhAddress1][NONRENEWABLE_ENERGY]).to.equal(
          100
        );
        expect(instance.households[hhAddress2][NONRENEWABLE_ENERGY]).to.equal(
          0
        );
      });
    });
  });

  context("Deeds", () => {
    beforeEach(
      "with 4 households, totalRenewableEnergy = 0, availableRenewableEnergy = 200, neededRenewableEnergy = -200",
      () => {
        instance.addHousehold(hhAddress1);
        instance.addHousehold(hhAddress2);
        instance.addHousehold(hhAddress3);
        instance.addHousehold(hhAddress4);

        instance.updateRenewableEnergy(hhAddress1, 100);
        instance.updateRenewableEnergy(hhAddress2, 100);
        instance.updateRenewableEnergy(hhAddress3, -100);
        instance.updateRenewableEnergy(hhAddress4, -100);

        instance.settle();

        expect(instance.households[hhAddress1][RENEWABLE_ENERGY]).to.equal(0);
        expect(instance.households[hhAddress2][RENEWABLE_ENERGY]).to.equal(0);
        expect(instance.households[hhAddress3][RENEWABLE_ENERGY]).to.equal(0);
        expect(instance.households[hhAddress4][RENEWABLE_ENERGY]).to.equal(0);
      }
    );

    describe("deeds", () => {
      it("are created correctly", () => {
        instance.deeds = [];
        instance._addDeed(hhAddress1, hhAddress2, 101, RENEWABLE_ENERGY);
        const latestIndex = instance.deeds.length - 1;
        expect(instance.deeds[latestIndex].from).to.equal(hhAddress1);
        expect(instance.deeds[latestIndex].to).to.equal(hhAddress2);
        expect(instance.deeds[latestIndex].amount).to.equal(101);
        expect(instance.deeds[latestIndex].type).to.equal(RENEWABLE_ENERGY);
      });

      it("within settlement are created correctly", () => {
        const preLatestIndex = instance.deeds.length - 2;
        expect(instance.deeds[preLatestIndex].from).to.equal(hhAddress1);
        expect(instance.deeds[preLatestIndex].to).to.equal(hhAddress3);
        expect(instance.deeds[preLatestIndex].amount).to.equal(100);
        expect(instance.deeds[preLatestIndex].type).to.equal(RENEWABLE_ENERGY);
      });
    });

    describe("getDeeds", () => {
      it("should return all created deeds", () => {
        const deeds = instance.getDeeds(hhAddress1);
        expect(deeds.length).to.equal(1);
        expect(deeds[0].from).to.equal(hhAddress1);
        expect(deeds[0].to).to.equal(hhAddress3);
        expect(deeds[0].amount).to.equal(100);
        expect(deeds[0].type).to.equal(RENEWABLE_ENERGY);
      });
    });
  });
});
