pragma solidity >=0.5.0 <0.6.0;

import "./IUtility.sol";


/**
 * @title Utility
 * @notice Tracks production/consumption of energy of all households. Settles energy requests by distributing existing energy as fair as possible (netting).
 * @dev Implements interface IUtility.
 */
contract Utility is IUtility {
  address owner;
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

  modifier onlyOwner(address _owner) {
    require(msg.sender == owner, "Only owner may access this function!");
    _;
  }

  constructor (address _owner) public {
    owner = _owner;
  }

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
    Household storage hh = households[_household];
    hh.initialized = true;
    hh.energy = 0;
    hh.renewableEnergy = 0;
    hh.nonRenewableEnergy = 0;
    return true;
  }
}