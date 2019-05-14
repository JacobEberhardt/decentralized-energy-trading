pragma solidity >=0.5.0 <0.6.0;

import "./IUtilityBase.sol";


/**
 * @title Utility interface
 */
contract IUtility is IUtilityBase {
  function settle() external returns (bool);

  function deedsLength(uint256 _blockNumber) public view returns (uint256);
}
