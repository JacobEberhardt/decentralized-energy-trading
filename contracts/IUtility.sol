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

    function updateEnergy(address _household, int256 _producedEnergy, int256 _consumedEnergy) external returns (int256);

  function settle() external returns (bool);

  // implicitly declared by public constants
  //function totalEnergy() external view returns (int256);

  //function totalRenewableEnergy() external view returns (int256);

  //function totalNonRenewableEnergy() external view returns (int256);

  /**
   * @dev Get energy properties of _household
   * @param _household address of the household owner/ parity node ?
   * @return properties (initialized, energy, renewableEnergy, nonRenewableEnergy) of _household if _household exists
   */
  function getHousehold(address _household) external view returns (bool, int256, int256, int256);

  /**
   * @dev Get energy of _household
   * @param _household address of the household owner/ parity node ?
   * @return int256 energy of _household if _household exists
   */
  function balanceOf(address _household) external view returns (int256);

  /**
   * @dev Get renewable energy of _household
   * @param _household address of the household owner/ parity node ?
   * @return int256 renewable energy of _household if _household exists
   */
  function balanceOfRenewableEnergy(address _household) external view returns (int256);

  /**
   * @dev Get non-renewable energy of _household
   * @param _household address of the household owner/ parity node ?
   * @return int256 non-renewable energy of _household if _household exists
   */
  function balanceOfNonRenewableEnergy(address _household) external view returns (int256);
}
