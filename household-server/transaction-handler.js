/**
 * This handler creates, signes and sends transactions to the Smart Contract (IUtility.sol)
 * @param data Object containing the produced and consumed energy
 */
module.exports = data => {
  console.log("Transaction Handler received: ", data);
  const Web3 = require("web3");
  const RpcURL = "";
  const ContractAdress = "";
  const ABI = "";
  const HouseholdAdress = "";

  // instantiate contract and web3
  const web3 = new Web3(RpcURL);
  const contract = new web3.eth.Contract(ABI, ContractAdress);

  // prepare transactions
  const produced = data.produce;
  const consumed = data.consume;

  // sign transactions
  // to be done as we don't have a key yet

  // send transaction
  contract.methods
    .updateRenewableEnergy(HouseholdAdress, produced, consumed)
    .send();
};
