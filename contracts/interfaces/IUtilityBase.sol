pragma solidity >=0.5.0 <0.6.0;


/**
 * @title UtilityBase interface
 */
contract IUtilityBase {

  event NewHousehold(address indexed household);

  event RenewableEnergyChanged(address indexed household, int256 energy);

  event NonRenewableEnergyChanged(address indexed household, int256 energy);

  function addHousehold(address _household) external returns (bool);

  function removeHousehold(address _household) external returns (bool);

  function updateRenewableEnergy(address _household, int256 _producedEnergy, int256 _consumedEnergy) external returns (bool);

  function updateNonRenewableEnergy(address _household, int256 _producedEnergy, int256 _consumedEnergy) external returns (bool);

  function getHousehold(address _household) external view returns (bool, int256, int256, int256, int256, int256, int256);

  function totalEnergy() external view returns (int256);

  function totalConsumedEnergy() external view returns (int256);

  function totalProducedEnergy() external view returns (int256);

  function balanceOf(address _household) external view returns (int256);

  function balanceOfConsumedEnergy(address _household) external view returns (int256);

  function balanceOfProducedEnergy(address _household) external view returns (int256);

  function balanceOfRenewableEnergy(address _household) external view returns (int256);

  function balanceOfConsumedRenewableEnergy(address _household) external view returns (int256);

  function balanceOfProducedRenewableEnergy(address _household) external view returns (int256);

  function balanceOfNonRenewableEnergy(address _household) external view returns (int256);

  function balanceOfConsumedNonRenewableEnergy(address _household) external view returns (int256);

  function balanceOfProducedNonRenewableEnergy(address _household) external view returns (int256);
}
