pragma solidity >=0.5.0 <0.6.0;

import "openzeppelin-solidity/contracts/drafts/SignedSafeMath.sol";


/**
 * @title SignedMath
 * @notice Implementation of signed math operations.
 * @dev Implements math operations for signed int256.
 */
library SignedMath {
  using SignedSafeMath for int256;

  /**
   * @dev Returns the absolute value of _number
   * @param _number int256
   * @return int256
   */
  function abs(int256 _number) internal pure returns (int256) {
    return _number < 0 ? _number.mul(-1) : _number;
  }

  /**
   * @dev Returns the minimum of _a and _b
   * @param _a int256
   * @param _b int256
   * @return int256
   */
  function min(int256 _a, int256 _b) internal pure returns (int256) {
    return _a < _b ? _a : _b;
  }
}
