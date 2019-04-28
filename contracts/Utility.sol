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
    require(households[_household].initialized == false, "Household already exists.");

    // add new household to mapping
    Household storage hh = households[_household];
    hh.initialized = true;
    hh.energy = 0;
    hh.renewableEnergy = 0;
    hh.nonRenewableEnergy = 0;
    return true;
  }

  /**
   * @dev Increase the amount of renewable energy of _household by _value
   * @param _household address of the household owner/ parity node ?
   * @param _value int256 amount of energy
   * @return success bool if household exists and _value > 0
   */
  function increaseRenewableEnergy(address _household, int256 _value) external returns (bool) {
    require(households[_household].initialized == true, "Household does not exist.");
    require(_value > 0, "_value is zero or negative");

    households[_household].renewableEnergy = households[_household].renewableEnergy + _value;
    households[_household].energy = households[_household].renewableEnergy + households[_household].nonRenewableEnergy;

    totalRenewableEnergy = totalRenewableEnergy + _value;
    totalEnergy = totalRenewableEnergy + totalNonRenewableEnergy;
    return true;
  }

  /**
   * @dev Increase the amount of non-renewable energy of _household by _value
   * @param _household address of the household owner/ parity node ?
   * @param _value int256 amount of energy
   * @return success bool if household exists and _value > 0
   */
  function increaseNonRenewableEnergy(address _household, int256 _value) external returns (bool) {
    require(households[_household].initialized == true, "Household does not exist.");
    require(_value > 0, "_value is zero or negative");

    households[_household].nonRenewableEnergy = households[_household].nonRenewableEnergy + _value;
    households[_household].energy = households[_household].renewableEnergy + households[_household].nonRenewableEnergy;

    totalNonRenewableEnergy = totalNonRenewableEnergy + _value;
    totalEnergy = totalRenewableEnergy + totalNonRenewableEnergy;
    return true;
  }

  /**
   * @dev Decrease the amount of renewable energy of _household by _value
   * @param _household address of the household owner/ parity node ?
   * @param _value int256 amount of energy
   * @return success bool if household exists and _value > 0
   */
  function decreaseRenewableEnergy(address _household, int256 _value) external returns (bool) {
    require(households[_household].initialized == true, "Household does not exist.");
    require(_value > 0, "_value is zero or negative");

    households[_household].renewableEnergy = households[_household].renewableEnergy - _value;
    households[_household].energy = households[_household].renewableEnergy + households[_household].nonRenewableEnergy;

    totalRenewableEnergy = totalRenewableEnergy - _value;
    totalEnergy = totalRenewableEnergy + totalNonRenewableEnergy;
    return true;
  }

  /**
   * @dev Decrease the amount of non-renewable energy of _household by _value
   * @param _household address of the household owner/ parity node ?
   * @param _value int256 amount of energy
   * @return success bool if household exists and _value > 0
   */
  function decreaseNonRenewableEnergy(address _household, int256 _value) external returns (bool) {
    require(households[_household].initialized == true, "Household does not exist.");
    require(_value > 0, "_value is zero or negative");

    households[_household].nonRenewableEnergy = households[_household].nonRenewableEnergy - _value;
    households[_household].energy = households[_household].renewableEnergy + households[_household].nonRenewableEnergy;

    totalNonRenewableEnergy = totalNonRenewableEnergy - _value;
    totalEnergy = totalRenewableEnergy + totalNonRenewableEnergy;
    return true;
  }

  /**
   * @dev Get energy properties of _household
   * @param _household address of the household owner/ parity node ?
   * @return properties (initialized, energy, renewableEnergy, nonRenewableEnergy) of _household if _household exists
   */
  function getHousehold(address _household) external view returns (bool, int256, int256, int256) {
    require(households[_household].initialized == true, "Household does not exist.");

    return (
      households[_household].initialized,
      households[_household].energy,
      households[_household].renewableEnergy,
      households[_household].nonRenewableEnergy
    );
  }

  /* solium-disable-next-line */
  function settle() external returns (bool) {
    // ToDo
    return false;
  }
}