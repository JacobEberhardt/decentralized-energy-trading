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

  // total energy in the system
  int256 public totalEnergy;
  // total renewable energy in the system
  int256 public totalRenewableEnergy;
  // total non-renewable energy in the system
  int256 public totalNonRenewableEnergy;

  struct Household {
    // for checks if household exists
    bool initialized;

    // total energy household
    int256 energy;

    // total renewable/ non-renewable energy household
    int256 renewableEnergy;
    int256 nonRenewableEnergy;
  }

  // mapping of all households
  mapping(address => Household) households;

  // modifier such that only some authority can access functions
  modifier onlyEnergyAuthority() {
    // require(msg.sender == , "Only some authority may access this function.");
    _;
  }

  modifier householdExists(address _household) {
    require(households[_household].initialized, "Household does not exist.");
    _;
  }

  /* solium-disable-next-line */
  constructor() public Owned() {
    // Empty
  }

  /**
   * @dev Create a household with address _household to track energy production and consumption
   * @param _household address of the household owner/ parity node ?
   * @return success bool if household does not already exists, should only be called by some authority
   */
  function addHousehold(address _household) external onlyEnergyAuthority returns (bool) {
    require(!households[_household].initialized, "Household already exists.");

    // add new household to mapping
    Household storage hh = households[_household];
    hh.initialized = true;
    hh.energy = 0;
    hh.renewableEnergy = 0;
    hh.nonRenewableEnergy = 0;
    return true;
  }

  /**
   * @dev Updates a household's energy state
   * @param _household address of the household owner/ parity node ?
   * @param _producedEnergy int of the produced energy
   * @param _consumedEnergy int of the consumed energy
   * @return success bool returns true, if function was called successfully
   */
  function updateEnergy(address _household, int256 _producedEnergy, int256 _consumedEnergy)
  external
  householdExists(_household)
  returns (bool)
  {
    int256 netProducedEnergy = _producedEnergy - _consumedEnergy;

    // Todo: create/use a library for safe arithmetic
    require(_producedEnergy >= netProducedEnergy, "Subtraction overflow.");

    Household storage hh = households[_household];
    hh.renewableEnergy += netProducedEnergy;
    return true;
  }

  /**
   * @dev Get energy properties of _household
   * @param _household address of the household owner/ parity node ?
   * @return properties (initialized, energy, renewableEnergy, nonRenewableEnergy) of _household if _household exists
   */
  function getHousehold(address _household) external view householdExists(_household) returns (bool, int256, int256, int256) {

    return (
      households[_household].initialized,
      households[_household].energy,
      households[_household].renewableEnergy,
      households[_household].nonRenewableEnergy
    );
  }

  /**
   * @dev Get energy of _household
   * @param _household address of the household owner/ parity node ?
   * @return int256 energy of _household if _household exists
   */
  function balanceOf(address _household) external view householdExists(_household) returns (int256) {

    return households[_household].energy;
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
}
