pragma solidity >=0.5.0 <0.6.0;

import "./IUtility.sol";


/**
 * @title Utility
 * @dev Implements interface IUtility.
 */
contract Utility is IUtility {

  // total energy in the system
  uint256 totalEnergy;
  // total renewable energy in the system
  uint256 totalRenewableEnergy;
  // total non-renewable energy in the system
  uint256 totalNonRenewableEnergy;

  struct Household {
    // for checks if household exists
    bool initialized;

    // total energy household
    uint256 energy;

    // total renewable/ non-renewable energy household
    uint256 renewableEnergy;
    uint256 nonRenewableEnergy;
  }

  // mapping of all households
  mapping(address => Household) households;

  // modifier such that only some authority can access functions
  modifier onlyEnergyAuthority() {
    // require(msg.sender == );
    _;
  }

  /**
   * @dev Create a household to track energy production and consumption
   * @param _household address of the household owner/ parity node ?
   * @return success bool if household does not already exists, should only be called by some authority
   */
  function addHousehold(address _household) external onlyEnergyAuthority returns (bool) {
    require(households[_household].initialized == false, "Household already exists.");

    // add new household to mapping
    households[_household] = Household(
      true,
      0,
      0,
      0);

    return true;
  }
}