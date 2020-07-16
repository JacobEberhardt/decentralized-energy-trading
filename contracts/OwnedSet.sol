pragma solidity ^0.6.1;

import "./BaseOwnedSet.sol";



// An owned validator set contract where the owner can add or remove validators.
contract OwnedSet is BaseOwnedSet {
  // solium-disable-next-line
  constructor(address[] memory _initial) BaseOwnedSet(_initial) public {}

  // Called when an initiated change reaches finality and is activated.
  function finalizeChange()
    external override
    onlyOwner
  {
    baseFinalizeChange();
  }

  // MISBEHAVIOUR HANDLING

  function reportBenign(address _validator, uint256 _blockNumber)
    external override
  {
    baseReportBenign(msg.sender, _validator, _blockNumber);
  }

  function reportMalicious(address _validator, uint256 _blockNumber, bytes calldata _proof)
    external override
  {
    baseReportMalicious(
      msg.sender,
      _validator,
      _blockNumber,
      _proof
    );
  }
}