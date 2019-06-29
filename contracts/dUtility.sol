pragma solidity >=0.5.0 <0.6.0;

import "./interfaces/IdUtility.sol";
import "./interfaces/IVerifier.sol";
import "./Mortal.sol";

/**
 * @title Utility onchain settlement verifier.
 * @dev Inherits from UtilityBase.
 * NOTE: this contract stays as 'Utility.sol' for compatibility reasons ;)
 */
contract dUtility is Mortal, IdUtility {

  IVerifier private verifier;

  uint256[] public deeds;

  /**
   * @dev Sets the address of a ZoKrates verifier contract.
   * @param _verifier address of a deployed ZoKrates verifier contract
   */
  function setVerifier(address _verifier) external onlyOwner() returns (bool) {
    verifier = IVerifier(_verifier);
    return true;
  }

  /**
   * @dev Verifies netting by using ZoKrates verifier contract.
   * Emits NettingSuccess when netting could be verified
   */
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

  /**
   * @return uint256 length of all successfully verified settlements
   */
  function getDeedsLength() external view returns (uint256) {
    return deeds.length;
  }
}
