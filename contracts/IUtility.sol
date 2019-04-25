pragma solidity >=0.5.0 <0.6.0;

/**
 * @title Utility interface
 */
interface IUtility {

  function addHousehold(address household) external returns (bool);

  function increaseEnergy(address producer, uint addedValue) external returns (bool);

  function decreaseEnergy(address consumer, uint subtractedValue) external returns (bool);

  function settle() external returns (bool);

  function totalEnergy() external view returns (uint);

  function balanceOf(address household) external view returns (uint);

  event EnergyTransfer(address indexed household, uint updatedBalance);
}