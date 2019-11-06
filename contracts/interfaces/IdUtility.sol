pragma solidity >=0.5.0 <0.6.0;

/**
 * @title dUtility interface
 */
contract IdUtility {

  /* Events */
  event NewHousehold(address indexed household);

  event NettingSuccess();

  event CheckHashesSuccess();

  event RenewableEnergyChanged(address indexed household, bytes32 newDeltaEnergy);

  event NonRenewableEnergyChanged(address indexed household, bytes32 newDeltaEnergy);
  event ShowInput(bytes32[] indexed household);

  /* Household management */
  function addHousehold(address _household) external returns (bool);

  function getHousehold(address _household) external view returns (bool, bytes32, bytes32);

  function removeHousehold(address _household) external returns (bool);

  /* Settlement verification related methods */
  function setVerifier(address _verifier) external returns (bool);

  function _verifyNetting(
    uint256[2] memory _a,
    uint256[2][2] memory _b,
    uint256[2] memory _c,
    uint256[8] memory _input) private returns (bool success);

  function _checkHashes(address[] memory _households, bytes32[] memory _householdEnergyHashes) private returns (bool);

  function checkNetting(
    address[] calldata _households, 
    bytes32[] calldata _householdEnergyHashes, 
    uint256[2] calldata _a,
    uint256[2][2] calldata _b,
    uint256[2] calldata _c,
    uint256[8] calldata _input) external returns (bool);

  function getDeedsLength() external view returns (uint256);

  /* dUtility household balance change tracking methods */
  function updateRenewableEnergy(address _household, bytes32 deltaEnergy) external returns (bool);

  function updateNonRenewableEnergy(address _household, bytes32 deltaEnergy) external returns (bool);
}
