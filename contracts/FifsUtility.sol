pragma solidity >=0.5.0 <0.6.0;

import "./Utility.sol";


contract FifsUtility is Utility {
  // number of successful settlements done
  // used for backtracking
  uint256 public checkpoint;

  // iterable list of all households
  address[] householdList;
  // iterable list of all current households with positive amount of renewable energy
  address[] householdListWithEnergy;
  // iterable list of all current households with negative amount of renewable energy
  address[] householdListNoEnergy;

  struct Deed {
    bool active;
    address to;
    int256 energyTransferred;
    bool isRenewable;
  }

  // (household, checkpoint) -> Deed[]
  mapping(address => mapping(uint256 => Deed[])) deeds;

  constructor() public Utility() {
    checkpoint = 0;
  }

  /**
   * @dev Overrides addHousehold of Utility.sol
   */
  function addHousehold(address _household) external onlyOwner returns (bool) {
    if (super._addHousehold(_household)) {
      householdList.push(_household);
    }
  }

  /**
   * @dev Settlement function for netting (focus on renewable energy only)
   * @return success bool if settlement was successful
   */
  function settle() external returns (bool) {
    // amount of available renewable energy for settlement
    int256 availableRenewableEnergy;
    // amount of needed renewable energy
    int256 neededRenewableEnergy;

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
          availableRenewableEnergy = (households[householdList[i]].renewableEnergy);
        } else if (households[householdList[i]].renewableEnergy > 0 && households[householdList[i]].nonRenewableEnergy < 0) {
          // amount of renewable energy is positive
          householdListWithEnergy.push(householdList[i]);
          // add gap between renewable and non-renewable energy to available energy for settlement
          availableRenewableEnergy = (households[householdList[i]].renewableEnergy - households[householdList[i]].nonRenewableEnergy);
        }
      }
    }

    // remember: totalRenewableEnergy = availableRenewableEnergy + neededRenewableEnergy
    neededRenewableEnergy = totalRenewableEnergy - availableRenewableEnergy;

    for (uint256 i = 0; i < householdListNoEnergy.length; i++) {
      Household storage hhNeeded = households[householdListNoEnergy[i]];
      // calculate % of energy on neededRenewableEnergy by household i
      int256 proportionNeedRenewableEnergy = 100 * (-1) * hhNeeded.renewableEnergy / (-1) * neededRenewableEnergy;
      // calculate amount of energy on availableRenewableEnergy by household i
      int256 amountAvailableRenewableEnergy = availableRenewableEnergy * proportionNeedRenewableEnergy / 100;
      for (uint256 j = 0; j < householdListWithEnergy.length; j++) {
        // settle energy
        if (households[householdListWithEnergy[j]].renewableEnergy >= amountAvailableRenewableEnergy) {
          households[householdListWithEnergy[j]].renewableEnergy -= amountAvailableRenewableEnergy;
          households[householdListWithEnergy[i]].renewableEnergy += amountAvailableRenewableEnergy;

          // create deed
          Deed[] storage deed = deeds[householdListWithEnergy[j]][checkpoint];
          Deed memory newDeed;
          newDeed.active = true;
          newDeed.to = householdListWithEnergy[i];
          newDeed.energyTransferred = amountAvailableRenewableEnergy;
          newDeed.isRenewable = true;
          deed.push(newDeed);

          break;
        } else {
          int256 energyTransferred = households[householdListWithEnergy[j]].renewableEnergy;

          households[householdListWithEnergy[i]].renewableEnergy += energyTransferred;
          amountAvailableRenewableEnergy -= energyTransferred;
          households[householdListWithEnergy[j]].renewableEnergy = 0;

          // create deed
          Deed[] storage deed = deeds[householdListWithEnergy[j]][checkpoint];
          Deed memory newDeed;
          newDeed.active = true;
          newDeed.to = householdListWithEnergy[i];
          newDeed.energyTransferred = energyTransferred;
          newDeed.isRenewable = true;
          deed.push(newDeed);
        }
      }
    }

    // clean setup for next settlement
    delete householdListNoEnergy;
    delete householdListWithEnergy;

    checkpoint += 1;
    return true;
  }

  /**
   * @dev 'Finalizes' an energy transfer by emitting event EnergyTransfer
   * @param _household address of the household owner/ parity node ?
   * @param _checkpoint uint256 the settlement number the sender wants to retrieve the reward
   * @return int256 the total amount of energy transferred by _household in settlement _checkpoint
   */
  function retrieveReward(address _household, uint256 _checkpoint)
    external
    onlyHousehold(_household)
    returns (int256 sumEnergyTransferred)
  {
    sumEnergyTransferred = 0;
    Deed[] storage deed = deeds[_household][_checkpoint];

    for (uint256 i = 0; i < deed.length; i++) {
      require(deed[i].active, "Deed does not exist");

      emit EnergyTransfer(
        _household,
        deed[i].to,
        deed[i].energyTransferred,
        deed[i].isRenewable);

      sumEnergyTransferred += deed[i].energyTransferred;
    }
    delete deeds[_household][checkpoint];
  }
}
