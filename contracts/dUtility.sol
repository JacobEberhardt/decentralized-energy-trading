
pragma solidity >=0.5.0 <0.6.0;

import "./interfaces/IdUtility.sol";
import "./interfaces/IVerifier.sol";
import "./Mortal.sol";

/**
 * @title Utility onchain settlement verifier.
 * @dev Inherits from IdUtility. This approach is analoguous to UtilityBase.sol but with
 * private energy state changes.
 */
contract dUtility is Mortal, IdUtility {

  struct Household {
    // for checks if household exists
    bool initialized;

    // Hashes of (deltaEnergy)
    bytes32 renewableEnergy;
    bytes32 nonRenewableEnergy;
    bytes32 afterNettingDelta;
  }

  uint lastInputIndex = 0;
  uint nonZeroHashes = 0;

  // mapping of all households
  mapping(address => Household) households;

  modifier onlyHousehold(address _household) {
    require(msg.sender == _household, "No permission to access. Only household may access itself.");
    _;
  }

  modifier householdExists(address _household) {
    require(households[_household].initialized, "Household does not exist.");
    _;
  }

  uint256[] public deeds;

  IVerifier private verifier;

  /**
   * @dev Create a household with address _household to track energy production and consumption.
   * Emits NewHousehold when household was added successfully.
   * @param _household address of the household
   * @return success bool if household does not already exists, should only be called by some authority
   */
  function addHousehold(address _household) external onlyOwner() returns (bool) {
    return _addHousehold(_household);
  }

  /**
   * @dev Get energy properties of _household.
   * @param _household address of the household
   * @return Household stats (initialized,
   *                          renewableEnergy,
   *                          nonRenewableEnergy)
   *          of _household if _household exists
   */
  function getHousehold(address _household) external view householdExists(_household) returns (bool, bytes32, bytes32) {
    Household memory hh = households[_household];
    return (
      hh.initialized,
      hh.renewableEnergy,
      hh.nonRenewableEnergy
    );
  }

  /**
   * @dev Get afterNettingHash of households.
   * @param _household address of the household
   * @return Household stats (afterNettingDelta) of _household if _household exists
   */
  function getHouseholdAfterNettingHash(address _household) external view householdExists(_household) returns (bytes32) {
    Household memory hh = households[_household];
    return hh.afterNettingDelta;
  }

  /**
   * @dev Removes a household.
   * @param _household address of the household
   * @return success bool if household does not already exists, should only be called by some authority
   */
  function removeHousehold(address _household) external onlyOwner() householdExists(_household) returns (bool) {
    delete households[_household];
  }

  /**
   * @dev Sets the address of a ZoKrates verifier contract.
   * @param _verifier address of a deployed ZoKrates verifier contract
   */
  function setVerifier(address _verifier) external onlyOwner() returns (bool) {
    verifier = IVerifier(_verifier);
    return true;
  }

   /**
   * @dev Returns next non-zero hash in concatinated format and counts number of nonZero hashes that are needed for later check
   * @param hashes array of hashes
   * @return next concatinated hash
   */
  function _concatNextHash(uint256[400] memory hashes) private returns (bytes32){
    bytes32 res;
    while(lastInputIndex < hashes.length / 2){
      // This assumes that if the first half of the hash is all zero's the second will aswell.
      // Not sure if saved gas (because we check only one part of the hash) is worth the risk of getting a hash that starts with 32 zeros and netting failing
      if(hashes[lastInputIndex] != 0){
        res = bytes32(uint256(hashes[lastInputIndex] << 128 | hashes[lastInputIndex + 1]));
        ++nonZeroHashes;
        lastInputIndex += 2;
        break;
      }
      lastInputIndex += 2;
    }
    return res;
  }

  /**
   * @dev Verifies netting by using ZoKrates verifier contract.
   * Emits  when netting could be verified
   */
  function _verifyNetting(
    uint256[2] memory _a,
    uint256[2][2] memory _b,
    uint256[2] memory _c,
    uint256[400] memory _input) private returns (bool success) {
    success = verifier.verifyTx(_a, _b, _c, _input);
    if (success) {
      uint256 record = block.number;
      deeds.push(record);
    }
  }

  /**
   * @dev Validates the equality of the given households and their energy hashes against
   * dUtility's own recorded energy hashes (that the household server sent).
   * Emits CheckHashesSuccess on successful validation.
   * Throws when _households and _householdEnergyHashes length are not equal.
   * Throws when an energy change hash mismatch has been found.
   * @param _households array of household addresses to be checked.
   * @param _inputs array of the corresponding energy hashes.
   * @return true, iff, all given household energy hashes are mathes with the recorded energy hashes.
   */
  function _checkHashes(
    address[] memory _households,
    uint256[400] memory _inputs
  ) private returns (bool) {
    lastInputIndex = 0;
    nonZeroHashes = 0;
    uint numberOfInputHashes = _inputs.length / 2;
    for(uint256 i = 0; i < _households.length; ++i) {
      address addr = _households[i];
      bytes32 energyHash = _concatNextHash(_inputs);

      require(households[addr].renewableEnergy == energyHash, "Household energy hash mismatch.");
      _updateAfterNettingDelta(addr, [_inputs[(lastInputIndex + numberOfInputHashes - 2)], _inputs[(lastInputIndex + numberOfInputHashes - 1)]]);
    }
    require(_households.length == nonZeroHashes, "Number of Household mismatch with nonZeorHashes");
    return true;
  }

  function checkNetting(
    address[] calldata _households,
    uint256[2] calldata _a,
    uint256[2][2] calldata _b,
    uint256[2] calldata _c,
    uint256[400] calldata _input
    ) external returns (bool){
    // Ensure that all households that reported meter_delta !=0 in the netting reported are represented in both, addresslist and hashlist sent to SC
    // require address.len == hash_not_0.len / 2 where hash_not_0 is hashes recreated from _input that are not 0.
    // To evaluate the _input hashes, we need to loop through the addresslist provided with the proof and check whether the SC hash registry has values
    require(_checkHashes(_households, _input) == true, "Hashes not matching!");
    require(_verifyNetting(_a, _b, _c, _input) == true, "Netting proof failed!");
    emit NettingSuccess();
    return true;
  }

  /**
   * @return uint256 length of all successfully verified settlements
   */
  function getDeedsLength() external view returns (uint256) {
    return deeds.length;
  }

  /**
   * @dev Updates a household's renewable energy state calling _updateEnergy
   * @param _household address of the household
   * @param _deltaEnergy bytes32 hash of (delta+nonce+senderAddr)
   * @return success bool returns true, if function was called successfully
   */
  function updateRenewableEnergy(address _household, bytes32 _deltaEnergy)
  external
  onlyHousehold(_household)
  returns (bool) {
    _updateEnergy(_household, _deltaEnergy, true);
  }

  /**
   * @dev Updates a household's non-renewable energy state calling _updateEnergy
   * @param _household address of the household
   * @param _deltaEnergy bytes32 hash of (delta+nonce+senderAddr)
   * @return success bool returns true, if function was called successfully
   */
  function updateNonRenewableEnergy(address _household, bytes32 _deltaEnergy)
  external onlyHousehold(_household)
  returns (bool) {
    _updateEnergy(_household, _deltaEnergy, false);
  }

    /**
   * @dev Updates a household's energy state
   * @param _household address of the household
   * @param _deltaEnergy bytes32 hash of (delta+nonce+senderAddr)
   * @param _isRenewable bool indicates whether said energy is renewable or non-renewable
   * @return success bool returns true, if function was called successfully
   */
  function _updateEnergy(address _household, bytes32 _deltaEnergy, bool _isRenewable)
  internal
  householdExists(_household)
  returns (bool) {
    Household storage hh = households[_household];
    if (_isRenewable) {
      hh.renewableEnergy = _deltaEnergy;
      emit RenewableEnergyChanged(_household, _deltaEnergy);
    } else {
      hh.nonRenewableEnergy = _deltaEnergy;
      emit NonRenewableEnergyChanged(_household, _deltaEnergy);
    }
    return true;
  }

  /**
   * @dev Updates a household's energy state
   * @param _household address of the household
   * @param _afterNettingDelta both halfs of post netting delta hash
   * @return success bool returns true, if function was called successfully
   */
  function _updateAfterNettingDelta(address _household, uint256[2] memory _afterNettingDelta)
  internal
  householdExists(_household)
  {
    Household storage hh = households[_household];
    hh.afterNettingDelta = bytes32(uint256(_afterNettingDelta[0] << 128 | _afterNettingDelta[1]));
  }

  /**
   * @dev see UtilityBase.addHousehold
   * @param _household address of household
   * @return success bool
   */
  function _addHousehold(address _household) internal onlyOwner returns (bool) {
    require(!households[_household].initialized, "Household already exists.");

    // add new household to mapping
    Household storage hh = households[_household];
    hh.initialized = true;
    hh.renewableEnergy = 0;
    hh.nonRenewableEnergy = 0;

    emit NewHousehold(_household);
    return true;
  }

  function _setVerifier(address _verifier) internal returns (bool) {
    verifier = IVerifier(_verifier);
    return true;
  }
}