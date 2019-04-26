pragma solidity >=0.5.0 <0.6.0;


/**
 * @title Utility interface
 */
interface IUtility {

  // event for energy transfer triggered by netting
  event EnergyTransfer(address indexed household, uint updatedBalance);

  /**
   * @dev Create a household to track energy production and consumption
   * @param _household address of the household owner/ parity node ?
   * @return success bool if household does not already exists, should only be called by some authority
   */
  function addHousehold(address _household) external returns (bool);

  function increaseEnergy(address producer, uint addedValue) external returns (bool);

  function decreaseEnergy(address consumer, uint subtractedValue) external returns (bool);

  function settle() external returns (bool);

  function totalEnergy() external view returns (uint);

  function balanceOf(address household) external view returns (uint);
}