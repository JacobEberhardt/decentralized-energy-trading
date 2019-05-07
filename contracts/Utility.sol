pragma solidity >=0.5.0 <0.6.0;

import "./IUtility.sol";
import "./Mortal.sol";


/**
 * @title Utility
 * @notice Tracks production/consumption of energy of all households. Settles energy requests by distributing existing energy as fair as possible (netting).
 * @dev Implements interface IUtility.
 */
contract Utility is IUtility, Mortal {
  /*
   * electrical work/energy W, unit 1 kWh = 1000 Wh = 1000 W * 3600 s = 3,6 * 10^6 Ws
   * (int256) 1 means 1 Ws?
   */

  // total renewable energy in the system
  int256 public totalRenewableEnergy;
  // total non-renewable energy in the system
  int256 public totalNonRenewableEnergy;

  struct Household {
    // for checks if household exists
    bool initialized;

    // total renewable/ non-renewable energy household
    int256 renewableEnergy;
    int256 nonRenewableEnergy;
  }

  // mapping of all households
  mapping(address => Household) households;

  modifier onlyHousehold(address _household) {
    require(msg.sender == _household, "No permission to access. Only household can access itself.");
    _;
  }

  modifier householdExists(address _household) {
    require(households[_household].initialized, "Household does not exist.");
    _;
  }

  /* solium-disable-next-line */
  constructor() public Owned() { }

  /**
   * @dev Create a household with address _household to track energy production and consumption.
   * Emits NewHousehold when household was added successfully.
   * @param _household address of the household owner/ parity node ?
   * @return success bool if household does not already exists, should only be called by some authority
   */
  function addHousehold(address _household) external onlyOwner returns (bool) {
    return _addHousehold(_household);
  }

  /**
   * @dev Updates a household's renewable energy state calling _updateEnergy
   * @param _household address of the household owner/ parity node ?
   * @param _producedEnergy int256 of the produced energy
   * @param _consumedEnergy int256 of the consumed energy
   * @return success bool returns true, if function was called successfully
   */
  function updateRenewableEnergy(address _household, int256 _producedEnergy, int256 _consumedEnergy)
    external
    returns (bool)
  {
    return _updateEnergy(
      _household,
      _producedEnergy,
      _consumedEnergy,
      true
    );
  }

  /**
   * @dev Updates a household's non-renewable energy state calling _updateEnergy
   * @param _household address of the household owner/ parity node ?
   * @param _producedEnergy int256 of the produced energy
   * @param _consumedEnergy int256 of the consumed energy
   * @return success bool returns true, if function was called successfully
   */
  function updateNonRenewableEnergy(address _household, int256 _producedEnergy, int256 _consumedEnergy)
    external
    returns (bool)
  {
    return _updateEnergy(
      _household,
      _producedEnergy,
      _consumedEnergy,
      false
    );
  }

  /**
   * @dev Get energy properties of _household
   * @param _household address of the household owner/ parity node ?
   * @return properties (initialized, renewableEnergy, nonRenewableEnergy) of _household if _household exists
   */
  function getHousehold(address _household) external view householdExists(_household) returns (bool, int256, int256) {
    return (
      households[_household].initialized,
      households[_household].renewableEnergy,
      households[_household].nonRenewableEnergy
    );
  }

  /**
   * @dev Get total energy
   * @return int256 total energy
   */
  function totalEnergy() external view returns (int256) {
    return totalRenewableEnergy + totalNonRenewableEnergy;
  }

  /**
   * @dev Get energy of _household
   * @param _household address of the household owner/ parity node ?
   * @return int256 energy of _household if _household exists
   */
  function balanceOf(address _household) external view householdExists(_household) returns (int256) {
    return households[_household].renewableEnergy + households[_household].nonRenewableEnergy;
  }

  /**
   * @dev Get renewable energy of _household
   * @param _household address of the household owner/ parity node ?
   * @return int256 renewable energy of _household if _household exists
   */
  function balanceOfRenewableEnergy(address _household) external view householdExists(_household) returns (int256) {
    return households[_household].renewableEnergy;
  }

  /**
   * @dev Get non-renewable energy of _household
   * @param _household address of the household owner/ parity node ?
   * @return int256 non-renewable energy of _household if _household exists
   */
  function balanceOfNonRenewableEnergy(address _household) external view householdExists(_household) returns (int256) {
    return households[_household].nonRenewableEnergy;
  }

  /* solium-disable-next-line */
  function settle() external returns (bool) {
    // ToDo
    return false;
  }

  /**
   * @dev see Utility.addHousehold
   * @param _household address of household
   * @return bool success
   */
  function _addHousehold(address _household) internal returns (bool) {
    require(!households[_household].initialized, "Household already exists.");

    // add new household to mapping
    Household storage hh = households[_household];
    hh.initialized = true;
    hh.renewableEnergy = 0;
    hh.nonRenewableEnergy = 0;

    emit NewHousehold(_household);
    return true;
  }

  /**
   * @dev Updates a household's energy state
   * @param _household address of the household owner/ parity node ?
   * @param _producedEnergy int256 of the produced energy
   * @param _consumedEnergy int256 of the consumed energy
   * @param _isRenewable bool indicates whether said energy is renewable or non-renewable
   * @return success bool returns true, if function was called successfully
   */
  function _updateEnergy(
    address _household,
    int256 _producedEnergy,
    int256 _consumedEnergy,
    bool _isRenewable
    )
    private
    onlyHousehold(_household)
    householdExists(_household)
    returns (bool)
  {
    require(_producedEnergy >= 0 && _consumedEnergy >= 0, "Produced and consumed energy amount must be positive.");
    int256 netProducedEnergy = _producedEnergy - _consumedEnergy;

    // Todo: create/use a library for safe arithmetic
    /*
     * If _producedEnergy and _consumedEnergy are positive, there cant be any subtraction overflow. Consider the following:
     * MAX_int256 - MAX_int256; no overflow,
     * 0 - MAX_int256; because MAX_int256 = 2**256/2 -1 = 2**255 -1 no overflow,
     * MAX_int256 - 0; no overflow.
     * Library for safe arithmetic need to handle MAX_int256 +1, etc. but with respect to int256 its pretty unusual to overflow int256
     */
    //require(netProducedEnergy <= _producedEnergy, "Subtraction overflow.");

    Household storage hh = households[_household];
    if (_isRenewable) {
      hh.renewableEnergy += netProducedEnergy;
      totalRenewableEnergy += netProducedEnergy;
      emit RenewableEnergyChanged(_household, netProducedEnergy);
    } else {
      hh.nonRenewableEnergy += netProducedEnergy;
      totalNonRenewableEnergy += netProducedEnergy;
      emit NonRenewableEnergyChanged(_household, netProducedEnergy);
    }

    return true;
  }
}
