pragma solidity >=0.5.0 <0.6.0;


/**
 * @title Utility interface
 */
interface IUtility {

  // event for energy transfer triggered by settlement (netting)
  event EnergyTransfer(address indexed household, uint updatedBalance);

  event NewHousehold(address indexed household);

  function addHousehold(address _household) external returns (bool);

  function updateEnergy(address _household, int256 _producedEnergy, int256 _consumedEnergy) external returns (bool);

  function settle() external returns (bool);

  function getHousehold(address _household) external view returns (bool, int256, int256, int256);

  function balanceOf(address _household) external view returns (int256);

  function balanceOfRenewableEnergy(address _household) external view returns (int256);

  function balanceOfNonRenewableEnergy(address _household) external view returns (int256);
}
