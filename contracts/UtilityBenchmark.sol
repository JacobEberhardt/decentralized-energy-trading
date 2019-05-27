pragma solidity >=0.5.0 <0.6.0;

import "./Utility.sol";


contract UtilityBenchmark is Utility {

  /**
   * @dev Adds n+m households with specific energy states. Bypasses modifiers in favor of benchmarks
   * and simplicity
   * WARNING: Do not use in production
   * @param _numProducingHouseholds uint256 number of producing households to be created
   * @param _numConsumingHouseholds uint256 number of consuming households to be created
   * @param _renewableEnergyProduce int256 constant positive number of energy produced for all
   * producing households
   * @param _renewableEnergyConsume int256 constant negative number of energy produced for all
   * consuming households
   */
  constructor(
    uint256 _numProducingHouseholds,
    uint256 _numConsumingHouseholds,
    int256 _renewableEnergyProduce,
    int256 _renewableEnergyConsume)
    public
  {
    require(_renewableEnergyProduce >= 0, "UtilityBenchmark: only provide positive values for _renewableEnergyProduce.");
    require(_renewableEnergyConsume <= 0, "UtilityBenchmark: only provide negative values for _renewableEnergyConsume.");


    for (uint256 i = 0; i < _numProducingHouseholds; ++i) {
      address mockAddress = address(bytes20(keccak256(_toBytes(i))));
      if (super._addHousehold(mockAddress)) {
        householdList.push(mockAddress);
        households[mockAddress].renewableEnergy = _renewableEnergyProduce;
      }
    }

    for (uint256 i = 0; i < _numConsumingHouseholds; ++i) {
      address mockAddress = address(bytes20(keccak256(_toBytes(i+_numProducingHouseholds*2))));
      if (super._addHousehold(mockAddress)) {
        householdList.push(mockAddress);
        households[mockAddress].renewableEnergy = _renewableEnergyConsume;
      }
    }
  }

  /**
   * @dev Converts a uint to 32 a bytes array
   * This function is adapted from Nick Johnson's answer: https://ethereum.stackexchange.com/a/4177
   * @param _x uint256 the number to convert
   * @return bytes converted number in bytes
   */
  function _toBytes(uint256 _x) private pure returns (bytes memory b) {
    b = new bytes(32);
    /* solium-disable-next-line */
    assembly { mstore(add(b, 32), _x) }
  }
}
