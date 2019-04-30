const Utility = artifacts.require('Utility');
const { BN, constants, expectEvent, shouldFail } = require('openzeppelin-test-helpers');
const chai = require('chai')
  .use(require('chai-bn')(BN))
  .should();

contract('Utility', async ([owner, household]) => {

  beforeEach(async () => {
    this.instance = await Utility.new({from: owner});
    await this.instance.addHousehold(household); // Add dummy household
    
  });

  describe('Record energy production/consumption', async () => {
    it('should record the net amount of energy produced correctly', async () => {
      await this.instance.updateEnergy(household, 10, 5);
      let netEnergy = await this.instance.balanceOfRenewableEnergy(household);
      netEnergy.should.be.bignumber.equal('5');
    });

    it('should revert on overflow', async () => {
      await shouldFail.reverting(this.instance.updateEnergy(household, 0, constants.MAX_UINT256));
    });

  });
});
