pragma solidity >=0.5.0 <0.6.0;


/**
 * @title Utility interface
 */
interface IUtility {

  // event for energy transfer triggered by settlement (netting)
  event EnergyTransfer(address indexed household, uint updatedBalance);

  /**
   * @dev Create a household to track energy production and consumption
   * @param _household address of the household owner/ parity node ?
   * @return success bool if household does not already exists, should only be called by some authority
   */
  function addHousehold(address _household) external returns (bool);

  /**
   * @dev Increase the amount of renewable energy of _household by _value
   * @param _household address of the household owner/ parity node ?
   * @param _value int256 amount of energy
   * @return success bool if household exists and _value > 0
   */
  function increaseRenewableEnergy(address _household, int256 _value) external returns (bool);

  /**
   * @dev Increase the amount of non-renewable energy of _household by _value
   * @param _household address of the household owner/ parity node ?
   * @param _value int256 amount of energy
   * @return success bool if household exists and _value > 0
   */
  function increaseNonRenewableEnergy(address _household, int256 _value) external returns (bool);

  /**
   * @dev Decrease the amount of renewable energy of _household by _value
   * @param _household address of the household owner/ parity node ?
   * @param _value int256 amount of energy
   * @return success bool if household exists and _value > 0
   */
  function decreaseRenewableEnergy(address _household, int256 _value) external returns (bool);

  /**
   * @dev Decrease the amount of non-renewable energy of _household by _value
   * @param _household address of the household owner/ parity node ?
   * @param _value int256 amount of energy
   * @return success bool if household exists and _value > 0
   */
  function decreaseNonRenewableEnergy(address _household, int256 _value) external returns (bool);

  function settle() external returns (bool);

  function totalEnergy() external view returns (int256);

  function totalRenewableEnergy() external view returns (int256);

  function totalNonRenewableEnergy() external view returns (int256);

  /**
   * @dev Get energy properties of _household
   * @param _household address of the household owner/ parity node ?
   * @return properties (initialized, energy, renewableEnergy, nonRenewableEnergy) of _household if _household exists
   */
  function getHousehold(address _household) external view returns (bool, int256, int256, int256);
}