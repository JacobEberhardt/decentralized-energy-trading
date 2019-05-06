pragma solidity >=0.5.0 <0.6.0;

import "./Utility.sol";


contract FifsUtility is Utility {
  // number of successful settlements done
  // used for backtracking
  uint256 public checkpoint;

  // iterable list of all households
  address[] public householdList;
  // iterable list of all current households with positive amount of renewable energy
  address[] public householdListWithEnergy;
  // iterable list of all current households with negative amount of renewable energy
  address[] public householdListNoEnergy;

  struct Deed {
    bool active;
    address to;
    int256 energyTransferred;
    bool isRenewable;
  }

  // (household, checkpoint) -> Deed[]
  mapping(address => mapping(uint256 => Deed[])) public deeds;

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

    // group households into households with positive amount of renewable energy
    // and negative amount of renewable energy
    for (uint256 i = 0; i < householdList.length; i++) {
      if (households[householdList[i]].renewableEnergy < 0) {
        // households with negative amount of renewable energy
        householdListNoEnergy.push(householdList[i]);
      } else if (households[householdList[i]].renewableEnergy > 0) {
        // households with positive amount of renewable energy
        householdListWithEnergy.push(householdList[i]);
        availableRenewableEnergy += households[householdList[i]].renewableEnergy;
      }
    }

    // remember: totalRenewableEnergy = availableRenewableEnergy + neededRenewableEnergy
    // remember: availableRenewableEnergy > 0
    neededRenewableEnergy = totalRenewableEnergy - availableRenewableEnergy;

    // not enough renewable energy for settlement; neededRenewableEnergy > availableRenewableEnergy
    if (totalRenewableEnergy < 0) {
      for (uint256 i = 0; i < householdListNoEnergy.length; i++) {
        Household storage hhNeeded = households[householdListNoEnergy[i]];
        // calculate % of energy on neededRenewableEnergy by household i
        int256 proportionNeedRenewableEnergy = 100 * (-1) * hhNeeded.renewableEnergy / ((-1) * neededRenewableEnergy);
        // calculate amount of energy on availableRenewableEnergy by household i
        int256 amountAvailableRenewableEnergy = availableRenewableEnergy * proportionNeedRenewableEnergy / 100;
        for (uint256 j = 0; j < householdListWithEnergy.length; j++) {
          // settle energy
          if (households[householdListWithEnergy[j]].renewableEnergy >= amountAvailableRenewableEnergy) {
            // energy for settlement by household j is >= needed by household i; household i can serve more households
            households[householdListWithEnergy[j]].renewableEnergy -= amountAvailableRenewableEnergy;
            households[householdListNoEnergy[i]].renewableEnergy += amountAvailableRenewableEnergy;

            // create deed
            Deed[] storage deed = deeds[householdListWithEnergy[j]][checkpoint];
            Deed memory newDeed;
            newDeed.active = true;
            newDeed.to = householdListNoEnergy[i];
            newDeed.energyTransferred = amountAvailableRenewableEnergy;
            newDeed.isRenewable = true;
            deed.push(newDeed);

            break;
          } else if (households[householdListWithEnergy[j]].renewableEnergy < amountAvailableRenewableEnergy && households[householdListWithEnergy[j]].renewableEnergy > 0) {
            // energy for settlement by household j is < needed by household i
            int256 energyTransferred = households[householdListWithEnergy[j]].renewableEnergy;

            households[householdListNoEnergy[i]].renewableEnergy += energyTransferred;
            amountAvailableRenewableEnergy -= energyTransferred;
            households[householdListWithEnergy[j]].renewableEnergy = 0;

            // create deed
            Deed[] storage deed = deeds[householdListWithEnergy[j]][checkpoint];
            Deed memory newDeed;
            newDeed.active = true;
            newDeed.to = householdListNoEnergy[i];
            newDeed.energyTransferred = energyTransferred;
            newDeed.isRenewable = true;
            deed.push(newDeed);
          }
        }
      }
    } else {
      // totalRenewableEnergy >= 0
      // enough renewable energy for settlement; availableRenewableEnergy >= neededRenewableEnergy
      for (uint256 i = 0; i < householdListWithEnergy.length; i++) {
        Household storage hhAvailable = households[householdListWithEnergy[i]];
        // calculate % of energy on availableRenewableEnergy by household i
        int256 proportionAvailableRenewableEnergy = 100 * hhAvailable.renewableEnergy / availableRenewableEnergy;
        // calculate amount of energy on neededRenewableEnergy by household i
        int256 amountNeededRenewableEnergy = (-1) * neededRenewableEnergy * proportionAvailableRenewableEnergy / 100;
        for (uint256 j = 0; j < householdListNoEnergy.length; j++) {
          // settle energy
          if (households[householdListNoEnergy[j]].renewableEnergy < 0) {
            // check if household j is already done with settlement
            if (amountNeededRenewableEnergy > (-1) * households[householdListNoEnergy[j]].renewableEnergy) {
              // energy for settlement by household i is > needed by household j; household i can serve more households
              int256 energyTransferred = (-1) * households[householdListNoEnergy[j]].renewableEnergy;

              households[householdListWithEnergy[i]].renewableEnergy -= energyTransferred;
              amountNeededRenewableEnergy -= energyTransferred;
              households[householdListNoEnergy[j]].renewableEnergy += energyTransferred;

              // create deed
              Deed[] storage deed = deeds[householdListWithEnergy[i]][checkpoint];
              Deed memory newDeed;
              newDeed.active = true;
              newDeed.to = householdListNoEnergy[j];
              newDeed.energyTransferred = energyTransferred;
              newDeed.isRenewable = true;
              deed.push(newDeed);
            } else {
              // energy for settlement by household i is <= needed by household j
              households[householdListWithEnergy[i]].renewableEnergy -= amountNeededRenewableEnergy;
              households[householdListNoEnergy[j]].renewableEnergy += amountNeededRenewableEnergy;

              // create deed
              Deed[] storage deed = deeds[householdListWithEnergy[i]][checkpoint];
              Deed memory newDeed;
              newDeed.active = true;
              newDeed.to = householdListNoEnergy[j];
              newDeed.energyTransferred = amountNeededRenewableEnergy;
              newDeed.isRenewable = true;
              deed.push(newDeed);

              break;
            }
          }
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
