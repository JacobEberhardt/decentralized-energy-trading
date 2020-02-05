const fs = require('fs')

function generateHelperFuncs(wE, nE) {

    return `
//The Script generated the Code for ${wE + nE} HHs
//The comments and explanations are provided for an example with n households!

import "hashes/sha256/512bitPacked.code" as sha256packed

// Aggregates the combined meterDelta of Energy producing HHS.
// @param {field[n]} Energy producing HHs
// @returns {field} meterDelta of provided households
def deltaProducers(field[${wE}] hh) -> (field):
  field delta = 0
  for field i in 0..${wE} do
    delta = delta + hh[i]
  endfor
  return delta

// Aggregates the combined meterDelta of Energy consuming HHS.
// @param {field[m]} Energy producing HHs
// @returns {field} meterDelta of provided households
def deltaConsumers(field[${nE}] hh) -> (field):
  field delta = 0
  for field i in 0..${nE} do
    delta = delta + hh[i]
  endfor
  return delta

// Returns total energy balance of the system. Remember, this balance can be available or needed energy.
// @param {field[n]} producersBeforeNet
// @param {field[m]} consumersBeforeNet
// @returns {field} totalEnergy
def calculateTotalDelta(field[${wE}] producersBeforeNet, field[${nE}] consumersBeforeNet) -> (field):
  producerDelta = deltaProducers(producersBeforeNet)
  consumerDelta = deltaConsumers(consumersBeforeNet)
  field totalDelta = if (producerDelta > consumerDelta) then (producerDelta - consumerDelta) else (consumerDelta - producerDelta) fi
  return totalDelta

// Returns sum of deltas between hh and hhNet with Energy
// @param {field[n]} hh
// @param {field[n]} hhNet
// @returns {field} delta
def deltaNetProducers(field[${wE}] hh, field[${wE}] hhNet) -> (field):
  field delta = 0
  for field i in 0..${wE - 1} do
    delta = delta + (hh[i] - hhNet[i])
  endfor
  return delta

// Returns sum of deltas between hh and hhNet without Energy
// @param {field[m]} hh
// @param {field[m]} hhNet
// @returns {field} delta
def deltaNetConsumers(field[${nE}] hh, field[${nE}] hhNet) -> (field):
  field delta = 0
  for field i in 0..${nE} do
    delta = delta + (hh[i] - hhNet[i])
  endfor
  return delta

// Returns errorCounter. Implements weak fairness invariant for HHs with Energy
// @param {field[n]} hh
// @param {field[n]} hhNet
// @returns {field} errorCounter
def validateFairnessProducers(field[${wE}] hh, field[${wE}] hhNet) -> (field):
  field errorCounter = 0
  for field i in 0..${wE - 1} do
    errorCounter = errorCounter + if hhNet[i] > hh[i] then 1 else 0 fi
  endfor
  return errorCounter

// Returns errorCounter. Implements weak fairness invariant for HHs without Energy
// @param {field[m]} hh
// @param {field[m]} hhNet
// @returns {field} errorCounter
def validateFairnessConsumers(field[${nE}] hh, field[${nE}] hhNet) -> (field):
  field errorCounter = 0
  for field i in 0..${nE} do
    errorCounter = errorCounter + if hhNet[i] > hh[i] then 1 else 0 fi
  endfor
  return errorCounter

// Validates the zero-net property (one set of household will be 0 (up to an epislon error) after netting)
// for the case of sumProducers <= sumConsumers
// Is valid, only if returns 0.
// @param (field[n]) household party having energy
// @param epsilon the error tolerance value
def validateZeroNetProducers(field[${wE}] hh, field epsilon) -> (field):
  field errorCounter = 0
  for field i in 0..${wE} do
    errorCounter = errorCounter + if hh[i] > epsilon then 1 else 0 fi
  endfor
  return errorCounter

// Validates the zero-net property (one set of household will be 0 (up to an epislon error) after netting)
// for the case of sumProducers >= sumConsumers
// Is valid, only if returns 0.
// @param (field[m]) household party needing
// @param epsilon the error tolerance value
def validateZeroNetConsumers(field[${nE}] hh, field epsilon) -> (field):
  field errorCounter = 0
  for field i in 0..${nE} do
    errorCounter = errorCounter + if hh[i] > epsilon then 1 else 0 fi
  endfor
  return errorCounter

// Simply return hh[0] + hh[1] for any array of households with energy.
// @param (field[n]) hh
// @returns (field) energy of provided households
def sumProducers(field[${wE}] hh) -> (field):
  field s = 0
  for field i in 0..${wE} do
    s = s + hh[i]
  endfor
  return s

// Simply return hh[0] + hh[1] for any array of households without energy.
// @param (field[m]) hh
// @returns (field) energy of provided households
def sumConsumers(field[${nE}] hh) -> (field):
  field s = 0
  for field i in 0..${nE} do
    s = s + hh[i]
  endfor
  return s
`;
  }
  
  function generateCode(wE, nE) {

    let energySumStringProducers = "  field energysumProducers = producersBeforeNet[0] + producersAfterNet[0]";
    let energySumStringConsumers = "  field energysumConsumers = consumersBeforeNet[0] + consumersAfterNet[0]";
    let packedString = "";
    let returnSignatureString = Array(2 * (wE + nE))
      .fill("field[2]", 0, (wE + nE) * 2 + 1)
      .join(",");
    let returnString = " return ";

    let uBound;;
    let lBound;

    if(wE >= nE){
      uBound = wE;
      lBound = nE;
    }
    else{
      uBound = nE;
      lBound = wE;
    }


    for(let i = 1; i < wE; i++){
      energySumStringProducers += ` + producersBeforeNet[${i}] + producersAfterNet[${i}]`;
    }
    
    for(let i = 1; i < nE; i++){
      energySumStringConsumers += ` + consumersBeforeNet[${i}] + consumersAfterNet[${i}]`;
    }
   
  for (let i = 0; i < wE; i++) {    
    packedString += `  field[2] hh${i +
      1}ProducersBeforeNetHash = if producersBeforeNet[${i}] == 0 then [0, 0] else sha256packed([0, 0, 0, producersBeforeNet[${i}]]) fi\n`;
    packedString += `  field[2] hh${i +
      1}ProducersAfterNetHash = if producersAfterNet[${i}] == 0 then [0, 0] else sha256packed([0, 0, 0, producersAfterNet[${i}]]) fi\n`;
  }

  for(let i = 0; i < nE; i++){
    packedString += `  field[2] hh${i +
      1}ConsumersBeforeNetHash = if consumersBeforeNet[${i}] == 0 then [0, 0] else sha256packed([0, 0, 0, consumersBeforeNet[${i}]]) fi\n`;
    packedString += `  field[2] hh${i +
      1}ConsumersAfterNetHash = if consumersAfterNet[${i}] == 0 then [0, 0] else sha256packed([0, 0, 0, consumersAfterNet[${i}]]) fi\n`;
  }

    for(let i = 0; i < wE; i++){
      returnString += ` hh${i + 1}ProducersBeforeNetHash,`;
    }
    for (let i = 0; i < nE; i++) {
      returnString += ` hh${i + 1}ConsumersBeforeNetHash,`;
    }
    for (let i = 0; i < wE; i++) {
      returnString += ` hh${i + 1}ProducersAfterNetHash,`;
    }
    for (let i = 0; i < nE; i++) {
      returnString += ` hh${i + 1}ConsumersAfterNetHash,`;
    }

    energySumStringConsumers += "\n";
  
    const helperFuncs = generateHelperFuncs(wE, nE);
  
    return `
  ${helperFuncs}

// Returns sha256packed hash if settlement result is consistent and proportional fair up to epsilon = (number of households - 1)
// Assume n = 4 households, where |householdListProducers| = 2 and |householdListConsumers| = 2
// Before settlement, households with produce-consume = 0 are not part of the settlement
// @param (private field[2]) producersBeforeNet before settlement
// Index represents household and producersBeforeNet[index] := produce-consume > 0 
// @param (private field[2]) consumersBeforeNet before settlement
// Index represents household and consumersBeforeNet[index] := produce-consume < 0 
// @param (private field[2]) producersAfterNet after settlement
// Index represents household and producersAfterNet[index] := produce-consume > 0 
// @param (private field[2]) consumersAfterNet after settlement
// Index represents household and consumersAfterNet[index] := produce-consume < 0
// @returns (field[2], field[2], field[2], field[2], field[2],...) sha256packed hashes of producersBeforeNetPacked and consumersBeforeNetPacked and sha256packed hash that depends on inputs
def main(private field[${wE}] producersBeforeNet, private field[${nE}] consumersBeforeNet, private field[${wE}] producersAfterNet, private field[${nE}] consumersAfterNet) -> (${returnSignatureString}):
  totalDelta = calculateTotalDelta(producersBeforeNet, consumersBeforeNet)
  totalDeltaNet = calculateTotalDelta(producersAfterNet, consumersAfterNet)
  totalDelta == totalDeltaNet

  0 == validateFairnessProducers(producersBeforeNet, producersAfterNet)
  0 == validateFairnessConsumers(consumersBeforeNet, consumersAfterNet)

  field sumProducers = sumProducers(producersAfterNet)
  field sumConsumers = sumConsumers(consumersAfterNet)

  field[${wE}] zeroNetPartyProducers = producersAfterNet
  field[${nE}] zeroNetPartyConsumers = consumersAfterNet

  0 == if sumProducers <= sumConsumers then validateZeroNetProducers(zeroNetPartyProducers, ${nE + wE - 1}) else validateZeroNetConsumers(zeroNetPartyConsumers, ${nE + wE - 1}) fi// Can make epsilon more accurate in the future
${packedString} ${returnString.slice(0, -1)}
`;
  }

  function generateNedServerConfig(wE, nE){
    return `
    module.exports = {
      // IP on which the ned server should run
      host: "127.0.0.1",
      // Port on which the ned server should listen
      port: 3005,
      // Ethereum address of NED node
      address: "0x00bd138abd70e2f00903268f3db08f2d25677c9e",
      // Password to unlock NED node
      password: "node0",
      // Name of JSON RPC interface specified in truffle-config.js
      network: "${network}",
      // Time Interval of the ned server triggering the netting in the ZoKrates execution environment
      nettingInterval: 10000,
      // Working directory of the file and the child process
      workingDir: "./ned-server",
      // File name to execute
      fileName: "helloworld.sh",
      // Execution environment for the file
      executionEnv: "bash",
      //No. of HHs with Energy Production
      hhProduce: ${wE},
      //No. of HHs with No Energy Production -> Only Consumption
      hhConsume: ${nE}
    };`
  }


  let args = process.argv.slice(2);

  let code;
  let code2;
  let wE;
  let nE;
  let network;

  if((args.length === 2 || args.length === 3) && args[0] >= 1 && args[1] >= 1){
      
    wE = Number(args[0]);
    nE = Number(args[1]);
    network = String(args[2]);

    if((network === "benchmark" || network === "ganache" || network === "authority")){
      network = network;
    }
    else{
      console.log("Wrong or no network provided...Default network: authority");
      network = "authority";
    }

    code = generateCode(wE, nE);
    
    fs.writeFile('zokrates-code/settlement-check.zok', code, 'utf8',(err) => {   
      if (err) throw err;
    })

    code2 = generateNedServerConfig(wE, nE);

    fs.writeFile('ned-server-config.js', code2, 'utf8',(err)=> {
      if (err) throw err;
    })

    function generateContracts(wE, nE){
      let len = (wE+nE) * 4;

      const iVerifier = `
pragma solidity >=0.5.0 <0.6.0;
/**
* @title Verifier contract interface
*/
contract IVerifier {
  function verifyTx(
    uint[2] memory a,
    uint[2][2] memory b,
    uint[2] memory c,
    uint[${len}] memory input) public returns (bool);
}`;

      const idUtility = `
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

  /* Household management */
  function addHousehold(address _household) external returns (bool);

  function getHousehold(address _household) external view returns (bool, bytes32, bytes32);

  function removeHousehold(address _household) external returns (bool);
  function _concatNextHash(uint256[${len}] memory hashes) private returns (bytes32);

  /* Settlement verification related methods */
  function setVerifier(address _verifier) external returns (bool);

  function _verifyNetting(
    uint256[2] memory _a,
    uint256[2][2] memory _b,
    uint256[2] memory _c,
    uint256[${len}] memory _input) private returns (bool success);

  function _checkHashes(
    address[] memory _households,
    uint256[${len}] memory _inputs
    ) private returns (bool);

  function checkNetting(
    address[] calldata _households,
    uint256[2] calldata _a,
    uint256[2][2] calldata _b,
    uint256[2] calldata _c,
    uint256[${len}] calldata _input) external returns (bool);

  function getTransfersLength() external view returns (uint256);

  /* dUtility household balance change tracking methods */
  function updateRenewableEnergy(address _household, bytes32 deltaEnergy) external returns (bool);

  function updateNonRenewableEnergy(address _household, bytes32 deltaEnergy) external returns (bool);
}`;

      const dUtility = `
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

  uint256[] public transfers;

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
  function _concatNextHash(uint256[${len}] memory hashes) private returns (bytes32){
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
    uint256[${len}] memory _input) private returns (bool success) {
    success = verifier.verifyTx(_a, _b, _c, _input);
    if (success) {
      uint256 record = block.number;
      transfers.push(record);
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
    uint256[${len}] memory _inputs
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
    uint256[${len}] calldata _input
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
  function getTransfersLength() external view returns (uint256) {
    return transfers.length;
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
}`;

      const warning = `/*
DO NOT EDIT THIS FILE!
It is generated by zokrates-code/zoKratesCodeGenerator.js
Edit the template there instead.
*/`

      fs.writeFile('contracts/interfaces/IVerifier.sol', warning + iVerifier, 'utf8',(err)=> {
        if (err) throw err;
      })
      fs.writeFile('contracts/interfaces/IdUtility.sol', warning + idUtility, 'utf8',(err)=> {
        if (err) throw err;
      })
      fs.writeFile('contracts/dUtility.sol', warning + dUtility, 'utf8',(err)=> {
        if (err) throw err;
      })

    }

    generateContracts(wE, nE);

    fs.writeFile('ned-server-config.js', code2, 'utf8',(err)=> {
      if (err) throw err;
    })


  }else{
      console.log("ERROR! The number of inputs provided is less than two OR inputs are not numbers OR not numbers >= 1! \nThe zoKrates-Code-Generation stopped! \nPlease provide for the numbers of HHs two integer values >= 1!");
    }
