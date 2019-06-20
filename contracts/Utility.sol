pragma solidity >=0.5.0 <0.6.0;

import "./interfaces/IUtility.sol";
import "./interfaces/IVerifier.sol";
import "./Mortal.sol";

/**
 * @title Utility onchain settlement verifier.
 * @dev Inherits from UtilityBase.
 * NOTE: this contract stays as 'Utility.sol' for compatibility reasons ;)
 */
contract Utility is IUtility {

  IVerifier private verifier;

  uint256[] public deeds;

  function setVerifier(address _verifier) external returns (bool) {
    verifier = IVerifier(_verifier);
    return true;
  }

  function verifyNetting(
    uint256[2] calldata _a,
    uint256[2][2] calldata _b,
    uint256[2] calldata _c,
    uint256[1] calldata _input) external returns (bool success) {
    success = verifier.verifyTx(_a, _b, _c, _input);
    if (success) {
      uint256 record = block.number;
      emit NettingSuccess(record);
      deeds.push(record);
    }
  }

  function getDeedsLength() external view returns (uint256) {
    return deeds.length;
  }
}
