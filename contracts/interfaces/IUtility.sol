pragma solidity >=0.5.0 <0.6.0;

import "./IUtilityBase.sol";


/**
 * @title Utility interface
 */
contract IUtility is IUtilityBase {

  event NettingSuccess(uint blockNumber);

  function setVerifier(address _verifier) external returns (bool);

  function verifyNetting(
    uint256[2] calldata _a,
    uint256[2][2] calldata _b,
    uint256[2] calldata _c,
    uint256[1] calldata _input) external returns (bool success);

  function getDeedsLength() external view returns (uint256);
}
