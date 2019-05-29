pragma solidity >=0.5.0 <0.6.0;

import "./interfaces/IUtility.sol";
import "./UtilityBase.sol";


/**
 * @title Standard Utility contract
 * @notice Implements FIFS settle algorithm.
 * @dev Inherits from UtilityBase.
 */
contract Utility is UtilityBase, IUtility {
  // iterable list of all households
  address[] public householdList;
  // iterable list of all current households with positive amount of renewable energy
  address[] public householdListWithEnergy;
  // iterable list of all current households with negative amount of renewable energy
  address[] public householdListNoEnergy;

  struct Deed {
    bool active;
    address from;
    address to;
    int256 renewableEnergyTransferred;
    int256 nonRenewbaleEnergyTransferred;
  }

  // block.number -> Deed[]
  mapping(uint256 => Deed[]) public deeds;

  /**
   * @dev Overrides addHousehold of UtilityBase.sol
   */
  function addHousehold(address _household) external returns (bool) {
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
        availableRenewableEnergy = availableRenewableEnergy.add(households[householdList[i]].renewableEnergy);
      }
    }

    // remember: totalRenewableEnergy = availableRenewableEnergy + neededRenewableEnergy
    // remember: availableRenewableEnergy > 0
    neededRenewableEnergy = totalRenewableEnergy.sub(availableRenewableEnergy);

    if (totalRenewableEnergy <= 0) {
      _proportionalDistribution(
        neededRenewableEnergy,
        availableRenewableEnergy,
        householdListNoEnergy,
        householdListWithEnergy);
    } else {
      _proportionalDistribution(
        neededRenewableEnergy,
        availableRenewableEnergy,
        householdListWithEnergy,
        householdListNoEnergy);
    }

    // clean setup for next settlement
    delete householdListNoEnergy;
    delete householdListWithEnergy;

    return true;
  }

  /**
   * @dev Get length of deeds array
   * @param _blockNumber uint256
   * @return uint256 length of deeds array at _blockNumber
   */
  function deedsLength(uint256 _blockNumber) public view returns (uint256) {
    return deeds[_blockNumber].length;
  }

  /**
   * @dev Distributes renewable energy by proportionally requesting/responding energy so that
   * _neededAvailableEnergy equals 0.
   * @param _neededRenewableEnergy int256 total needed renewable energy. Assumed to be negative.
   * @param _availableRenewableEnergy int256 total available energy. Assumed to be positive.
   * @param _hhFrom address[] storage
   * @param _hhTo address[] storage
   * @return success bool
   */
  function _proportionalDistribution(
    int256 _neededRenewableEnergy,
    int256 _availableRenewableEnergy,
    address[] storage _hhFrom,
    address[] storage _hhTo)
    private
    returns (bool)
  {
    // ToDo: need to find fitting variable names. It is hard to find names that fit opposite cases
    bool isMoreAvailableThanDemanded = _availableRenewableEnergy + _neededRenewableEnergy > 0 ? true : false;

    int256 energyReference = isMoreAvailableThanDemanded ?
      _availableRenewableEnergy : _neededRenewableEnergy;

    int256 energyToShare = isMoreAvailableThanDemanded ?
      _neededRenewableEnergy : _availableRenewableEnergy;

    uint256 needle = 0;
    address addressFrom;
    address addressTo;

    // We are always transferring energy from hhFrom to hhTo
    // Why does this work? By abusing the fact that might transfer a *negative* amount of energy, which
    // is like 'demanding'/'buying' energy from someone.
    for (uint256 i = 0; i < _hhFrom.length; ++i) {
      addressTo = _hhFrom[i];
      Household storage hh = households[addressTo];

      int256 proportionalFactor = (_abs(hh.renewableEnergy)
        .mul(100))
        .div(_abs(energyReference));
      int256 proportionalShare = (_abs(energyToShare)
        .mul(proportionalFactor))
        .div(100);

      for (uint256 j = needle; j < _hhTo.length; ++j) {
        addressFrom = _hhTo[j];
        Household storage hh2 = households[addressFrom];

        int256 toClaim = isMoreAvailableThanDemanded ? proportionalShare.mul(-1) : proportionalShare;
        int256 renewableEnergy = isMoreAvailableThanDemanded ? hh2.renewableEnergy.mul(-1) : hh2.renewableEnergy;

        if (renewableEnergy > proportionalShare) {
          _transfer(addressFrom, addressTo, toClaim);
          if (hh2.renewableEnergy == 0) {
            needle++;
          }
          break;
        } else {
          int256 energyTransferred = hh2.renewableEnergy;
          _transfer(addressFrom, addressTo, energyTransferred);
          proportionalShare = proportionalShare.sub(_abs(energyTransferred));
          needle++;
        }
      }
    }
    return true;
  }

  /**
   * @dev Adds a new deed.
   * If _amount is negative, this function will behave like _addDeed(_to, _from, ||_amount||)
   * @param _from address from address
   * @param _to address to adress
   * @param _amount int256 amount of renewable energy.
   * Note that it is intended that _amount might be a negative value.
   * @return success bool
   */
  function _addDeed(address _from, address _to, int256 _amount) private returns (bool) {
    address from = _from;
    address to = _to;
    int256 amount = _amount;
    if (_amount < 0) {
      from = _to;
      to = _from;
      amount = _abs(amount);
    }

    Deed[] storage deed = deeds[block.number];
    Deed memory newDeed;
    newDeed.active = true;
    newDeed.from = from;
    newDeed.to = to;
    newDeed.renewableEnergyTransferred = amount;
    deed.push(newDeed);

    return true;
  }

  /**
   * @dev Transfer energy from a household address to a household address.
   * Note that this function also creates a new Deed (see _addDeed()).
   * If _amount is negative, this function will behave like _transfer(_to, _from, ||_amount||)
   * @param _from address from address
   * @param _to address to adress
   * @return success bool
   */
  function _transfer(address _from, address _to, int256 _amount) private returns (bool) {
    address from = _from;
    address to = _to;
    int256 amount = _amount;
    if (_amount < 0) {
      from = _to;
      to = _from;
      amount = _abs(amount);
    }

    _updateEnergy(
      from,
      0,
      amount,
      true);
    _updateEnergy(
      to,
      amount,
      0,
      true);

    _addDeed(_from, _to, _amount);

    return true;
  }

  /**
   * @dev Returns the absolute value of _number
   * @param _number int256
   * @return int256
   */
  function _abs(int256 _number) private pure returns (int256) {
    return _number < 0 ? _number.mul(-1) : _number;
  }
}
