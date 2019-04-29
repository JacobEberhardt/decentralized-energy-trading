pragma solidity >=0.5.0 <0.6.0;

import "./Owned.sol";


/**
 * @title Mortal
 * @notice Simple mortal contract.
 * @dev Is inherited by derived contracts.
 */
contract Mortal is Owned {
  function close() public onlyOwner {
    selfdestruct(owner);
  }
}
