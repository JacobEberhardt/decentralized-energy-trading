/* eslint-disable no-unused-vars */
/* eslint-disable no-unused-expressions */
const Utility = artifacts.require("Utility");
const {
  BN,
  constants,
  expectEvent,
  shouldFail,
  time
} = require("openzeppelin-test-helpers");
const expect = require("chai").use(require("chai-bn")(BN)).expect;

contract("Utility", ([owner, hh1, hh2, hh3, hh4, hh5, hh6, hh7]) => {
  beforeEach(async () => {
    this.instance = await Utility.new({
      from: owner
    });
  });

  describe("Households", () => {
    context("with a new household", async () => {
      beforeEach(async () => {
        ({ logs: this.logs } = await this.instance.addHousehold(hh1, {
          from: owner
        }));
      });

      it("should create a new household", async () => {
        const hh = await this.instance.getHousehold(hh1, { from: hh1 });

        expect(hh[0]).to.be.true; // initialized
        expect(hh[1]).to.be.bignumber.that.is.zero; // renewableEnergy
        expect(hh[2]).to.be.bignumber.that.is.zero; // nonRenewableEnergy
      });

      it("should store addresses in householdList", async () => {
        expect((await this.instance.householdList(0)) === hh1);

        await this.instance.addHousehold(hh2, {
          from: owner
        });
        expect((await this.instance.householdList(1)) === hh2);
      });

      it("emits event NewHousehold", async () => {
        expectEvent.inLogs(this.logs, "NewHousehold", {
          household: hh1
        });
      });

      it("reverts when attempting to add an existing household", async () => {
        await shouldFail.reverting(
          this.instance.addHousehold(hh1, {
            from: owner
          })
        );
      });
    });
  });

  describe("Settlement", () => {
    beforeEach(async () => {
      await this.instance.addHousehold(hh1, {
        from: owner
      });
      await this.instance.addHousehold(hh2, {
        from: owner
      });
      await this.instance.addHousehold(hh3, {
        from: owner
      });
      await this.instance.addHousehold(hh4, {
        from: owner
      });
      await this.instance.addHousehold(hh5, {
        from: owner
      });
      await this.instance.addHousehold(hh6, {
        from: owner
      });
      await this.instance.addHousehold(hh7, {
        from: owner
      });
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

      it("availableRenewableEnergy = 200, neededRenewableEnergy = -400; with 7 households", async () => {
        await this.instance.updateRenewableEnergy(hh1, 50, 0, {
          from: hh1
        });
        expect(
          await this.instance.totalRenewableEnergy()
        ).to.be.bignumber.equal("50");

        await this.instance.updateRenewableEnergy(hh2, 70, 0, {
          from: hh2
        });
        expect(
          await this.instance.totalRenewableEnergy()
        ).to.be.bignumber.equal("120");

        await this.instance.updateRenewableEnergy(hh3, 40, 0, {
          from: hh3
        });
        expect(
          await this.instance.totalRenewableEnergy()
        ).to.be.bignumber.equal("160");

        await this.instance.updateRenewableEnergy(hh4, 40, 0, {
          from: hh4
        });
        expect(
          await this.instance.totalRenewableEnergy()
        ).to.be.bignumber.equal("200");

        await this.instance.updateRenewableEnergy(hh5, 0, 200, {
          from: hh5
        });
        expect(
          await this.instance.totalRenewableEnergy()
        ).to.be.bignumber.equal("0");

        await this.instance.updateRenewableEnergy(hh6, 0, 100, {
          from: hh6
        });
        expect(
          await this.instance.totalRenewableEnergy()
        ).to.be.bignumber.equal("-100");

        await this.instance.updateRenewableEnergy(hh7, 0, 25, {
          from: hh7
        });
        expect(
          await this.instance.totalRenewableEnergy()
        ).to.be.bignumber.equal("-125");

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
        ).to.be.bignumber.equal("4");
        expect(
          await this.instance.balanceOfRenewableEnergy(hh5)
        ).to.be.bignumber.equal("-78");
        expect(
          await this.instance.balanceOfRenewableEnergy(hh6)
        ).to.be.bignumber.equal("-40");
        expect(
          await this.instance.balanceOfRenewableEnergy(hh7)
        ).to.be.bignumber.equal("-11");
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

  describe("Consecutive settlements", () => {
    beforeEach(async () => {
      await this.instance.addHousehold(hh1, {
        from: owner
      });
      await this.instance.addHousehold(hh2, {
        from: owner
      });
      await this.instance.addHousehold(hh3, {
        from: owner
      });
      await this.instance.addHousehold(hh4, {
        from: owner
      });

      await this.instance.updateRenewableEnergy(hh1, 200, 0, {
        from: hh1
      });
      // 68
      await this.instance.updateRenewableEnergy(hh2, 100, 0, {
        from: hh2
      });
      // 34
      await this.instance.updateRenewableEnergy(hh3, 0, 100, {
        from: hh3
      });
      // 0
      await this.instance.updateRenewableEnergy(hh4, 0, 100, {
        from: hh4
      });
      // -2

      await this.instance.settle();
    });

    context("totalRenewableEnergy > 0", async () => {
      it("availableRenewableEnergy = 402, neededRenewableEnergy = -202; households need to split energy; rounded values therefore FIFS", async () => {
        await this.instance.updateRenewableEnergy(hh1, 200, 0, {
          from: hh1
        }); // 268
        expect(
          await this.instance.totalRenewableEnergy()
        ).to.be.bignumber.equal("300");

        await this.instance.updateRenewableEnergy(hh2, 100, 0, {
          from: hh2
        }); // 134
        expect(
          await this.instance.totalRenewableEnergy()
        ).to.be.bignumber.equal("400");

        await this.instance.updateRenewableEnergy(hh3, 0, 100, {
          from: hh3
        }); // -100
        expect(
          await this.instance.totalRenewableEnergy()
        ).to.be.bignumber.equal("300");

        await this.instance.updateRenewableEnergy(hh4, 0, 100, {
          from: hh4
        }); // -102
        expect(
          await this.instance.totalRenewableEnergy()
        ).to.be.bignumber.equal("200");

        await this.instance.settle();

        expect(
          await this.instance.balanceOfRenewableEnergy(hh1)
        ).to.be.bignumber.equal("135");
        expect(
          await this.instance.balanceOfRenewableEnergy(hh2)
        ).to.be.bignumber.equal("68");
        expect(
          await this.instance.balanceOfRenewableEnergy(hh3)
        ).to.be.bignumber.equal("0");
        expect(
          await this.instance.balanceOfRenewableEnergy(hh4)
        ).to.be.bignumber.equal("-3");
      });
    });
  });

  describe("Deeds", () => {
    beforeEach(async () => {
      await this.instance.addHousehold(hh1, {
        from: owner
      });
      await this.instance.addHousehold(hh2, {
        from: owner
      });
      await this.instance.addHousehold(hh3, {
        from: owner
      });
      await this.instance.addHousehold(hh4, {
        from: owner
      });

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
    });

    it("check deeds in deeds mapping", async () => {
      await this.instance.settle();
      const settleBlockNumber = await time.latestBlock();
      const deedsArrayLength = await this.instance
        .deedsLength(settleBlockNumber)
        .then(result => result.toNumber());

      const deeds = [];
      for (let i = 0; i < deedsArrayLength; i++) {
        deeds.push(await this.instance.deeds(settleBlockNumber, i));
      }

      expect(deeds[0].active).to.be.true; // active
      expect(deeds[0].from === hh1); // from
      expect(deeds[0].to === hh3); // to
      expect(deeds[0].renewableEnergyTransferred).to.be.bignumber.equal("100"); // renewableEnergyTransferred
      expect(deeds[0].nonRenewableEnergyTransferred).to.be.undefined; // nonRenewableEnergyTransferred

      expect(deeds[1].active).to.be.true; // active
      expect(deeds[1].from === hh1); // from
      expect(deeds[1].to === hh4); // to
      expect(deeds[1].renewableEnergyTransferred).to.be.bignumber.equal("32"); // renewableEnergyTransferred
      expect(deeds[1].nonRenewableEnergyTransferred).to.be.undefined; // nonRenewableEnergyTransferred

      expect(deeds[2].active).to.be.true; // active
      expect(deeds[2].from === hh2); // from
      expect(deeds[2].to === hh4); // to
      expect(deeds[2].renewableEnergyTransferred).to.be.bignumber.equal("66"); // renewableEnergyTransferred
      expect(deeds[2].nonRenewableEnergyTransferred).to.be.undefined; // nonRenewableEnergyTransferred
    });
  });
});
