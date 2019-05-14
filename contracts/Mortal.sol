pragma solidity >=0.5.0 <0.6.0;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";


/**
 * @title Mortal
 * @notice Allows owners to permanently disable this smart contract.
 * @dev Is inherited by derived contracts.
 */
contract Mortal is Ownable {
  function close() public onlyOwner {
    selfdestruct(address(0x0));
  }
}
