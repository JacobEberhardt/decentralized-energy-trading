pragma solidity >=0.5.0 <0.6.0;

import "./Utility.sol";


contract FifsUtility is Utility {

  // Number of successful settlements done
  // Used for backtracking
  uint256 public checkpoint;

  // Iterable list of all current households
  address[] householdList;

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
