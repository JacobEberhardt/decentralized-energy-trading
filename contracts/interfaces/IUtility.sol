pragma solidity >=0.5.0 <0.6.0;

import "./IUtilityBase.sol";


/**
 * @title Utility interface
 */
contract IUtility is IUtilityBase {

  event RequestNonRenewableEnergy(address indexed household, int256 energy);

  event EnergyCompensated(address household, int256 energy, bool isRenewable);

  function settle() external returns (bool);

  function transfersLength(uint256 _blockNumber) public view returns (uint256);
}
