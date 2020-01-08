pragma solidity >=0.5.0 <0.6.0;

import "./dUtility.sol";

/**
 * @title dUtlityBenchmark contract.
 * @dev Inherits from dUtility. Used for benchmarks.
 */
contract dUtilityBenchmark is dUtility {
  /**
   * @dev Sets up contract for conducting benchmarks.
   * @param _verifier Address of verifier contract.
   * @param _households List of household addresses to add for the benchmark.
   * @param _energyDeltaHashes List of energy delta hashes corresponding to household addresses.
   * @return success bool
   */
  function setupBenchmark(
    address _verifier,
    address[] calldata _households,
    bytes32[] calldata _energyDeltaHashes
  ) external onlyOwner returns (bool) {
    require(
      _households.length == _energyDeltaHashes.length,
      "Households have to be the same length as energy delta hashes."
    );

    _setVerifier(_verifier);

    for (uint i = 0; i < _households.length; ++i) {
      _addHousehold(_households[i]);
      // TODO test varying billing period
      _updateEnergy(42, _households[i], _energyDeltaHashes[i], true);
    }

    return true;
  }
}
