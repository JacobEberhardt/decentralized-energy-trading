pragma solidity >=0.5.0 <0.6.0;

import "openzeppelin-solidity/contracts/drafts/SignedSafeMath.sol";


import "./interfaces/IUtility.sol";
import "./Mortal.sol";


/**
 * @title UtilityBase
 * @notice Tracks energy production andconsumption of all households. Settles energy requests by distributing existing energy as fair as possible (netting).
 * @dev Implements interface IUtility.
 */
contract UtilityBase is IUtility, Mortal {
  using SignedSafeMath for int256;

  /*
   * electrical work/energy W, unit 1 kWh = 1000 Wh = 1000 W * 3600 s = 3,6 * 10^6 Ws
   * (int256) 1 means 1 Ws?
   */

  // total renewable energy in the system
  int256 public totalRenewableEnergy;
  // total produced and consumed renewable energy
  int256 public totalConsumedRenewableEnergy;
  int256 public totalProducedRenewableEnergy;

  // total non-renewable energy in the system
  int256 public totalNonRenewableEnergy;
  // total produced and consumed non-renewable energy
  int256 public totalConsumedNonRenewableEnergy;
  int256 public totalProducedNonRenewableEnergy;

  struct Household {
    // for checks if household exists
    bool initialized;

    // total renewable and non-renewable energy household
    int256 renewableEnergy;
    int256 nonRenewableEnergy;

    // produced and consumed renewable and non-renewable energy
    int256 producedRenewableEnergy;
    int256 consumedRenewableEnergy;
    int256 producedNonRenewableEnergy;
    int256 consumedNonRenewableEnergy;
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

  /**
   * @dev Create a household with address _household to track energy production and consumption.
   * Emits NewHousehold when household was added successfully.
   * @param _household address of the household
   * @return success bool if household does not already exists, should only be called by some authority
   */
  function addHousehold(address _household) external onlyOwner returns (bool) {
    return _addHousehold(_household);
  }

  /**
   * @dev Updates a household's renewable energy state calling _updateEnergy
   * @param _household address of the household
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
   * @param _household address of the household
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
   * @param _household address of the household
   * @return properties (initialized, renewableEnergy, nonRenewableEnergy) of _household if _household exists
   */
  function getHousehold(address _household)
    external
    view
    householdExists(_household)
    returns (bool, int256, int256, int256, int256, int256, int256)
    {
    Household memory hh = households[_household];
    return (
      hh.initialized,
      hh.renewableEnergy,
      hh.nonRenewableEnergy,
      hh.producedRenewableEnergy,
      hh.consumedRenewableEnergy,
      hh.producedNonRenewableEnergy,
      hh.consumedNonRenewableEnergy
    );
  }

  /**
   * @dev Get total energy
   * @return int256 total energy
   */
  function totalEnergy() external view returns (int256) {
    return totalRenewableEnergy.add(totalNonRenewableEnergy);
  }

  /**
   * @dev Get total consumed energy
   * @return int256 total consumed energy
   */
  function totalConsumedEnergy() external view returns (int256) {
    return totalConsumedRenewableEnergy.add(totalConsumedNonRenewableEnergy);
  }

  /**
   * @dev Get total produced energy
   * @return int256 total produced energy
   */
  function totalProducedEnergy() external view returns (int256) {
    return totalProducedRenewableEnergy.add(totalProducedNonRenewableEnergy);
  }

  /**
   * @dev Get energy of _household
   * @param _household address of the household
   * @return int256 energy of _household if _household exists
   */
  function balanceOf(address _household) external view householdExists(_household) returns (int256) {
    return households[_household].renewableEnergy.add(households[_household].nonRenewableEnergy);
  }

  /**
   * @dev Get consumed energy of _household
   * @param _household address of the household
   * @return int256 consumed energy of _household if _household exists
   */
  function balanceOfConsumedEnergy(address _household) external view householdExists(_household) returns (int256) {
    return households[_household].consumedRenewableEnergy.add(households[_household].consumedNonRenewableEnergy);
  }

  /**
   * @dev Get produced energy of _household
   * @param _household address of the household
   * @return int256 produced energy of _household if _household exists
   */
  function balanceOfProducedEnergy(address _household) external view householdExists(_household) returns (int256) {
    return households[_household].producedRenewableEnergy.add(households[_household].producedNonRenewableEnergy);
  }

  /**
   * @dev Get renewable energy of _household
   * @param _household address of the household
   * @return int256 renewable energy of _household if _household exists
   */
  function balanceOfRenewableEnergy(address _household) external view householdExists(_household) returns (int256) {
    return households[_household].renewableEnergy;
  }

  /**
   * @dev Get consumed renewable energy of _household
   * @param _household address of the household
   * @return int256 consumed renewable energy of _household if _household exists
   */
  function balanceOfConsumedRenewableEnergy(address _household) external view householdExists(_household) returns (int256) {
    return households[_household].consumedRenewableEnergy;
  }

  /**
   * @dev Get produced renewable energy of _household
   * @param _household address of the household
   * @return int256 produced renewable energy of _household if _household exists
   */
  function balanceOfProducedRenewableEnergy(address _household) external view householdExists(_household) returns (int256) {
    return households[_household].producedRenewableEnergy;
  }

  /**
   * @dev Get non-renewable energy of _household
   * @param _household address of the household
   * @return int256 non-renewable energy of _household if _household exists
   */
  function balanceOfNonRenewableEnergy(address _household) external view householdExists(_household) returns (int256) {
    return households[_household].nonRenewableEnergy;
  }

  /**
   * @dev Get consumed non-renewable energy of _household
   * @param _household address of the household
   * @return int256 consumed non-renewable energy of _household if _household exists
   */
  function balanceOfConsumedNonRenewableEnergy(address _household) external view householdExists(_household) returns (int256) {
    return households[_household].consumedNonRenewableEnergy;
  }

  /**
   * @dev Get produced non-renewable energy of _household
   * @param _household address of the household
   * @return int256 produced non-renewable energy of _household if _household exists
   */
  function balanceOfProducedNonRenewableEnergy(address _household) external view householdExists(_household) returns (int256) {
    return households[_household].producedNonRenewableEnergy;
  }

  /* solium-disable-next-line */
  function settle() external returns (bool) {
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
   * @param _household address of the household
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
    int256 netProducedEnergy = _producedEnergy.sub(_consumedEnergy);

    Household storage hh = households[_household];
    if (_isRenewable) {
      hh.consumedRenewableEnergy = hh.consumedRenewableEnergy.add(_consumedEnergy);
      hh.producedRenewableEnergy = hh.producedRenewableEnergy.add(_producedEnergy);
      hh.renewableEnergy = hh.renewableEnergy.add(netProducedEnergy);

      totalConsumedRenewableEnergy = totalConsumedRenewableEnergy.add(_consumedEnergy);
      totalProducedRenewableEnergy = totalProducedRenewableEnergy.add(_producedEnergy);
      totalRenewableEnergy = totalRenewableEnergy.add(netProducedEnergy);
      emit RenewableEnergyChanged(_household, netProducedEnergy);
    } else {
      hh.consumedNonRenewableEnergy = hh.consumedNonRenewableEnergy.add(_consumedEnergy);
      hh.producedNonRenewableEnergy = hh.producedNonRenewableEnergy.add(_producedEnergy);
      hh.nonRenewableEnergy = hh.nonRenewableEnergy.add(netProducedEnergy);

      totalConsumedNonRenewableEnergy = totalConsumedNonRenewableEnergy.add(_consumedEnergy);
      totalProducedNonRenewableEnergy = totalProducedNonRenewableEnergy.add(_producedEnergy);
      totalNonRenewableEnergy = totalNonRenewableEnergy.add(netProducedEnergy);
      emit NonRenewableEnergyChanged(_household, netProducedEnergy);
    }

    return true;
  }
}
