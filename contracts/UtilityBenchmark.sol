pragma solidity >=0.5.0 <0.6.0;

import "./Utility.sol";


contract UtilityBenchmark is Utility {

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

  function _toBytes(uint256 x) private pure returns (bytes memory b) {
    b = new bytes(32);
    /* solium-disable-next-line */
    assembly { mstore(add(b, 32), x) }
  }
}
