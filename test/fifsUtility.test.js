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

contract("FifsUtility", ([owner, hh1, hh2, hh3, hh4]) => {
  beforeEach(async () => {
    this.instance = await FifsUtility.new({
      from: owner
    });
  });

  describe("Checkpoint", () => {
    beforeEach(async () => {
      await this.instance.addHousehold(hh1);
      await this.instance.addHousehold(hh2);
      await this.instance.addHousehold(hh3);
      await this.instance.addHousehold(hh4);
    });

    it("should be initialized with 0", async () => {
      expect(await this.instance.checkpoint()).to.be.bignumber.that.is.zero;
    });

    context("After settlement", async () => {
      beforeEach(async () => {
        await this.instance.settle();
      });

      it("first settlement; should be 1", async () => {
        expect(await this.instance.checkpoint()).to.be.bignumber.equal("1");
      });

      it("second settlement; should be 2", async () => {
        await this.instance.settle();
        expect(await this.instance.checkpoint()).to.be.bignumber.equal("2");
      });
    });
  });

  describe("Households", () => {
    context("with a new household", async () => {
      beforeEach(async () => {
        ({ logs: this.logs } = await this.instance.addHousehold(hh1));
      });

      it("should create a new household", async () => {
        const hh = await this.instance.getHousehold(hh1);

        expect(hh[0]).to.be.true; // initialized
        expect(hh[1]).to.be.bignumber.that.is.zero; // renewableEnergy
        expect(hh[2]).to.be.bignumber.that.is.zero; // nonRenewableEnergy
      });

      it("should store addresses in householdList", async () => {
        expect((await this.instance.householdList(0)) === hh1);

        await this.instance.addHousehold(hh2);
        expect((await this.instance.householdList(1)) === hh2);
      });

      it("emits event NewHousehold", async () => {
        expectEvent.inLogs(this.logs, "NewHousehold", {
          household: hh1
        });
      });

      it("reverts when attempting to add an existing household", async () => {
        await shouldFail.reverting(this.instance.addHousehold(hh1));
      });
    });
  });

  describe("Settlement", () => {
    beforeEach(async () => {
      await this.instance.addHousehold(hh1);
      await this.instance.addHousehold(hh2);
      await this.instance.addHousehold(hh3);
      await this.instance.addHousehold(hh4);
    });

    context("totalRenewableEnergy = 0", async () => {
      it("availableRenewableEnergy = 200, neededRenewableEnergy = -200; households do not need to split energy", async () => {
        await this.instance.updateRenewableEnergy(hh1, 100, 0, {
          from: hh1
        });
        expect(
          await this.instance.totalRenewableEnergy()
        ).to.be.bignumber.equal("100");

        await this.instance.updateRenewableEnergy(hh2, 100, 0, {
          from: hh2
        });
        expect(
          await this.instance.totalRenewableEnergy()
        ).to.be.bignumber.equal("200");

        await this.instance.updateRenewableEnergy(hh3, 0, 100, {
          from: hh3
        });
        expect(
          await this.instance.totalRenewableEnergy()
        ).to.be.bignumber.equal("100");

        await this.instance.updateRenewableEnergy(hh4, 0, 100, {
          from: hh4
        });
        expect(
          await this.instance.totalRenewableEnergy()
        ).to.be.bignumber.equal("0");

        await this.instance.settle();

        expect(
          await this.instance.balanceOfRenewableEnergy(hh1)
        ).to.be.bignumber.equal("0");
        expect(
          await this.instance.balanceOfRenewableEnergy(hh2)
        ).to.be.bignumber.equal("0");
        expect(
          await this.instance.balanceOfRenewableEnergy(hh3)
        ).to.be.bignumber.equal("0");
        expect(
          await this.instance.balanceOfRenewableEnergy(hh4)
        ).to.be.bignumber.equal("0");
      });

      it("availableRenewableEnergy = 200, neededRenewableEnergy = -200; households need to split energy", async () => {
        await this.instance.updateRenewableEnergy(hh1, 40, 0, {
          from: hh1
        });
        expect(
          await this.instance.totalRenewableEnergy()
        ).to.be.bignumber.equal("40");

        await this.instance.updateRenewableEnergy(hh2, 160, 0, {
          from: hh2
        });
        expect(
          await this.instance.totalRenewableEnergy()
        ).to.be.bignumber.equal("200");

        await this.instance.updateRenewableEnergy(hh3, 0, 160, {
          from: hh3
        });
        expect(
          await this.instance.totalRenewableEnergy()
        ).to.be.bignumber.equal("40");

        await this.instance.updateRenewableEnergy(hh4, 0, 40, {
          from: hh4
        });
        expect(
          await this.instance.totalRenewableEnergy()
        ).to.be.bignumber.equal("0");

        await this.instance.settle();

        expect(
          await this.instance.balanceOfRenewableEnergy(hh1)
        ).to.be.bignumber.equal("0");
        expect(
          await this.instance.balanceOfRenewableEnergy(hh2)
        ).to.be.bignumber.equal("0");
        expect(
          await this.instance.balanceOfRenewableEnergy(hh3)
        ).to.be.bignumber.equal("0");
        expect(
          await this.instance.balanceOfRenewableEnergy(hh4)
        ).to.be.bignumber.equal("0");
      });
    });

    context("totalRenewableEnergy > 0", async () => {
      it("availableRenewableEnergy = 400, neededRenewableEnergy = -200; households need to split energy", async () => {
        await this.instance.updateRenewableEnergy(hh1, 200, 0, {
          from: hh1
        });
        expect(
          await this.instance.totalRenewableEnergy()
        ).to.be.bignumber.equal("200");

        await this.instance.updateRenewableEnergy(hh2, 200, 0, {
          from: hh2
        });
        expect(
          await this.instance.totalRenewableEnergy()
        ).to.be.bignumber.equal("400");

        await this.instance.updateRenewableEnergy(hh3, 0, 100, {
          from: hh3
        });
        expect(
          await this.instance.totalRenewableEnergy()
        ).to.be.bignumber.equal("300");

        await this.instance.updateRenewableEnergy(hh4, 0, 100, {
          from: hh4
        });
        expect(
          await this.instance.totalRenewableEnergy()
        ).to.be.bignumber.equal("200");

        await this.instance.settle();

        expect(
          await this.instance.balanceOfRenewableEnergy(hh1)
        ).to.be.bignumber.equal("100");
        expect(
          await this.instance.balanceOfRenewableEnergy(hh2)
        ).to.be.bignumber.equal("100");
        expect(
          await this.instance.balanceOfRenewableEnergy(hh3)
        ).to.be.bignumber.equal("0");
        expect(
          await this.instance.balanceOfRenewableEnergy(hh4)
        ).to.be.bignumber.equal("0");
      });

      it("availableRenewableEnergy = 300, neededRenewableEnergy = -200; households need to split energy; rounded values therefore FIFS", async () => {
        await this.instance.updateRenewableEnergy(hh1, 200, 0, {
          from: hh1
        });
        expect(
          await this.instance.totalRenewableEnergy()
        ).to.be.bignumber.equal("200");

        await this.instance.updateRenewableEnergy(hh2, 100, 0, {
          from: hh2
        });
        expect(
          await this.instance.totalRenewableEnergy()
        ).to.be.bignumber.equal("300");

        await this.instance.updateRenewableEnergy(hh3, 0, 100, {
          from: hh3
        });
        expect(
          await this.instance.totalRenewableEnergy()
        ).to.be.bignumber.equal("200");

        await this.instance.updateRenewableEnergy(hh4, 0, 100, {
          from: hh4
        });
        expect(
          await this.instance.totalRenewableEnergy()
        ).to.be.bignumber.equal("100");

        await this.instance.settle();

        expect(
          await this.instance.balanceOfRenewableEnergy(hh1)
        ).to.be.bignumber.equal("68");
        expect(
          await this.instance.balanceOfRenewableEnergy(hh2)
        ).to.be.bignumber.equal("34");
        expect(
          await this.instance.balanceOfRenewableEnergy(hh3)
        ).to.be.bignumber.equal("0");
        expect(
          await this.instance.balanceOfRenewableEnergy(hh4)
        ).to.be.bignumber.equal("-2");
      });
    });

    context("totalRenewableEnergy < 0", async () => {
      it("availableRenewableEnergy = 200, neededRenewableEnergy = -400; households need to split energy", async () => {
        await this.instance.updateRenewableEnergy(hh1, 100, 0, {
          from: hh1
        });
        expect(
          await this.instance.totalRenewableEnergy()
        ).to.be.bignumber.equal("100");

        await this.instance.updateRenewableEnergy(hh2, 100, 0, {
          from: hh2
        });
        expect(
          await this.instance.totalRenewableEnergy()
        ).to.be.bignumber.equal("200");

        await this.instance.updateRenewableEnergy(hh3, 0, 200, {
          from: hh3
        });
        expect(
          await this.instance.totalRenewableEnergy()
        ).to.be.bignumber.equal("0");

        await this.instance.updateRenewableEnergy(hh4, 0, 200, {
          from: hh4
        });
        expect(
          await this.instance.totalRenewableEnergy()
        ).to.be.bignumber.equal("-200");

        await this.instance.settle();

        expect(
          await this.instance.balanceOfRenewableEnergy(hh1)
        ).to.be.bignumber.equal("0");
        expect(
          await this.instance.balanceOfRenewableEnergy(hh2)
        ).to.be.bignumber.equal("0");
        expect(
          await this.instance.balanceOfRenewableEnergy(hh3)
        ).to.be.bignumber.equal("-100");
        expect(
          await this.instance.balanceOfRenewableEnergy(hh4)
        ).to.be.bignumber.equal("-100");
      });

      it("availableRenewableEnergy = 200, neededRenewableEnergy = -300; households need to split energy, round values therefore FIFS", async () => {
        await this.instance.updateRenewableEnergy(hh1, 100, 0, {
          from: hh1
        });
        expect(
          await this.instance.totalRenewableEnergy()
        ).to.be.bignumber.equal("100");

        await this.instance.updateRenewableEnergy(hh2, 100, 0, {
          from: hh2
        });
        expect(
          await this.instance.totalRenewableEnergy()
        ).to.be.bignumber.equal("200");

        await this.instance.updateRenewableEnergy(hh3, 0, 200, {
          from: hh3
        });
        expect(
          await this.instance.totalRenewableEnergy()
        ).to.be.bignumber.equal("0");

        await this.instance.updateRenewableEnergy(hh4, 0, 100, {
          from: hh4
        });
        expect(
          await this.instance.totalRenewableEnergy()
        ).to.be.bignumber.equal("-100");

        await this.instance.settle();

        expect(
          await this.instance.balanceOfRenewableEnergy(hh1)
        ).to.be.bignumber.equal("0");
        expect(
          await this.instance.balanceOfRenewableEnergy(hh2)
        ).to.be.bignumber.equal("2");
        expect(
          await this.instance.balanceOfRenewableEnergy(hh3)
        ).to.be.bignumber.equal("-68");
        expect(
          await this.instance.balanceOfRenewableEnergy(hh4)
        ).to.be.bignumber.equal("-34");
      });
    });
  });

  describe("Retrieve reward", () => {
    beforeEach(async () => {
      await this.instance.addHousehold(hh1);
      await this.instance.addHousehold(hh2);
      await this.instance.addHousehold(hh3);
      await this.instance.addHousehold(hh4);
    });

    context("Finalize settlement", async () => {
      beforeEach(async () => {
        await this.instance.updateRenewableEnergy(hh1, 200, 0, {
          from: hh1
        });
        await this.instance.updateRenewableEnergy(hh2, 100, 0, {
          from: hh2
        });
        await this.instance.updateRenewableEnergy(hh3, 0, 100, {
          from: hh3
        });
        await this.instance.updateRenewableEnergy(hh4, 0, 100, {
          from: hh4
        });

        await this.instance.settle();
      });

      it("check Deeds in deeds mapping", async () => {
        let deedsHH1 = [];
        let deedsHH2 = [];
        const checkpoint = await this.instance.checkpoint();

        // how to get the length of the deeds array ?
        // currently hardcoded: 2
        for (let i = 0; i < 2; i++) {
          deedsHH1.push(await this.instance.deeds(hh1, checkpoint - 1, i));
        }
        for (let i = 0; i < 1; i++) {
          deedsHH2.push(await this.instance.deeds(hh2, checkpoint - 1, i));
        }

        // hardcoded entries in array
        expect(deedsHH1[0].active).to.be.true; // active
        expect(deedsHH1[0].to === hh3); // to
        expect(deedsHH1[0].energyTransferred).to.be.bignumber.equal("100"); // energyTransferred
        expect(deedsHH1[0].isRenewable).to.be.true; // isRenewable

        expect(deedsHH1[1].active).to.be.true; // active
        expect(deedsHH1[1].to === hh4); // to
        expect(deedsHH1[1].energyTransferred).to.be.bignumber.equal("32"); // energyTransferred
        expect(deedsHH1[1].isRenewable).to.be.true; // isRenewable

        expect(deedsHH2[0].active).to.be.true; // active
        expect(deedsHH2[0].to === hh4); // to
        expect(deedsHH2[0].energyTransferred).to.be.bignumber.equal("66"); // energyTransferred
        expect(deedsHH2[0].isRenewable).to.be.true; // isRenewable
      });

      it("retrieve reward for (hh1, 0); should be 132", async () => {
        const checkpoint = await this.instance.checkpoint();
        expect(
          await this.instance.retrieveReward.call(hh1, checkpoint - 1, {
            from: hh1
          })
        ).to.be.bignumber.equal("132");
      });

      it("emits EnergyTransfer events", async () => {
        const checkpoint = await this.instance.checkpoint();
        ({ logs: this.logs } = await this.instance.retrieveReward(
          hh1,
          checkpoint - 1,
          {
            from: hh1
          }
        ));

        expectEvent.inLogs(this.logs, "EnergyTransfer", {
          from: hh1,
          to: hh3,
          energy: new BN(100),
          isRenewable: true
        });

        expectEvent.inLogs(this.logs, "EnergyTransfer", {
          from: hh1,
          to: hh4,
          energy: new BN(32),
          isRenewable: true
        });
      });
    });
  });
});
