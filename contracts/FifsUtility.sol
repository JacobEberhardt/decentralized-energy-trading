pragma solidity >=0.5.0 <0.6.0;

import "./Utility.sol";


contract FifsUtility is Utility {

  // number of successful settlements done
  // used for backtracking
  uint256 public checkpoint;

  // iterable list of all households
  address[] householdList;
  // iterable list of all current households with positive amount of energy
  address[] householdListWithEnergy;
  // iterable list of all current households with negative amount of energy
  address[] householdListNoEnergy;

  struct Deed {
    bool active;
    address to;
    uint256 energyTransferred;
    bool isRenewable;
  }

  // (household, checkpoint) -> Deed
  mapping(address => mapping(uint256 => Deed)) deeds;

  constructor() public Utility() {
    checkpoint = 0;
  }

  function addHousehold(address _household) external onlyOwner returns (bool) {
    if (super._addHousehold(_household)) {
      householdList.push(_household);
    }
  }

  function settle() external returns (bool) {
    require(totalRenewableEnergy > 0, "No renewable energy available for settlement.");

    // restructure this in seperate function ?
    // total amount of renewable energy for settlement
    uint256 availableRenewableEnergy;

    // group households into households sending renewable energy and households recievin renewable energy
    for (uint256 i = 0; i < householdList.length; i++) {
      if (households[householdList[i]].renewableEnergy + households[householdList[i]].nonRenewableEnergy <= 0) {
        // sum of renewable and non-renewable energy is negative or zero; no energy for settlement
        householdListNoEnergy.push(householdList[i]);
      } else {
        // sum of renewable and non-renewable energy is positive
        if (households[householdList[i]].renewableEnergy > 0 && households[householdList[i]].nonRenewableEnergy > 0) {
          // both amounts of renewable and non-renewable energy are positive
          householdListWithEnergy.push(householdList[i]);
          // add amount of renewable energy to available energy for settlement
          availableRenewableEnergy = uint256(households[householdList[i]].renewableEnergy);
        } else if (households[householdList[i]].renewableEnergy > 0 && households[householdList[i]].nonRenewableEnergy < 0) {
          // amount of renewable energy is positive
          householdListWithEnergy.push(householdList[i]);
          // add gap between renewable and non-renewable energy to available energy for settlement
          availableRenewableEnergy = uint256(households[householdList[i]].renewableEnergy - households[householdList[i]].nonRenewableEnergy);
        }
      }
    }

    // clean setup for next settlement
    delete availableRenewableEnergy;
    delete householdListNoEnergy;
    delete householdListWithEnergy;

    checkpoint += 1;
    return true;
  }

  /**
   * @dev 'Finalizes' an energy transfer by emitting event EnergyTransfer
   * @param _household address of the household owner
   * @param _checkpoint uint256 the settlement number the sender wants to retrieve the reward
   * @return uint256 the amount of energy transferred
   */
  function retrieveReward(address _household, uint256 _checkpoint) external onlyHousehold(_household) returns (uint256 energyTransferred) {
    Deed storage deed = deeds[_household][_checkpoint];
    require(deed.active, "Deed does not exist");

    emit EnergyTransfer(
      _household,
      deed.to,
      deed.energyTransferred,
      deed.isRenewable);

    energyTransferred = deed.energyTransferred;
    delete deeds[_household][_checkpoint];
  }
}
