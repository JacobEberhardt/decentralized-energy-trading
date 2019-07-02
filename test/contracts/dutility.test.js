/* eslint-disable no-unused-vars */
/* eslint-disable no-unused-expressions */
const UtilityBase = artifacts.require("dUtility");
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
    this.instance = await UtilityBase.new({
      from: owner
    });
    await this.instance.setVerifier(verifier.address, { from: owner });
  });

  describe("Households", () => {
    it("should create another new household", async () => {
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

  describe("Netting verification", () => {
    const NETTING_SUCCESS = "NettingSuccess";
    context("On a successful verification", async () => {
      beforeEach(async () => {
        await verifier.givenAnyReturnBool(true);
        ({ logs: this.logs } = await this.instance.verifyNetting(
          [0, 1],
          [[2, 3], [4, 5]],
          [6, 7],
          [8, 9],
          { from: household }
        ));
      });

      it(`should emit ${NETTING_SUCCESS} event`, async () => {
        expectEvent.inLogs(this.logs, NETTING_SUCCESS);
      });
    });

    it(`should not emit ${NETTING_SUCCESS} event on failure`, async () => {
      await verifier.givenAnyReturnBool(false);
      ({ logs: this.logs } = await this.instance.verifyNetting(
        [0, 1],
        [[2, 3], [4, 5]],
        [6, 7],
        [8, 9],
        { from: household }
      ));
      expect(this.logs).to.be.empty;
    });
  });

  describe("Hash checking", () => {
    const energyHashes = [
      "0xa5b9d60f32436310afebcfda832817a68921beb782fabf7915cc0460b443116a",
      "0xa5b9d60f32436310afebcfda832817a68921beb782fabf7915cc0460b443116b"
    ];
    beforeEach(async () => {
      await this.instance.addHousehold(household, {
        from: owner
      }); // Add dummy household
      await this.instance.addHousehold(household2, {
        from: owner
      }); // Add dummy household

      await this.instance.updateRenewableEnergy(household, energyHashes[0], {
        from: household
      });

      await this.instance.updateRenewableEnergy(household2, energyHashes[1], {
        from: household2
      });
    });

    const CHECK_SUCCESS = "CheckHashesSuccess";
    it(`should emit ${CHECK_SUCCESS} event on success`, async () => {
      ({ logs: this.logs } = await this.instance.checkHashes(
        [household, household2],
        energyHashes,
        { from: owner }
      ));
      expectEvent.inLogs(this.logs, CHECK_SUCCESS);
    });

    it(`should throw when not called by contract owner`, async () => {
      await shouldFail.reverting(
        this.instance.checkHashes([household, household2], energyHashes, {
          from: other
        })
      );
    });

    it(`should throw when input lengths are not equal`, async () => {
      await shouldFail.reverting(
        this.instance.checkHashes([household], energyHashes, {
          from: other
        })
      );
    });

    it(`should throw on energy hash mismatch`, async () => {
      const mismatchedEnergyHashes = ["0xdeadbeef", "0x0"];
      await shouldFail.reverting(
        this.instance.checkHashes(
          [household, household2],
          mismatchedEnergyHashes,
          {
            from: owner
          }
        )
      );
    });
  });
});
