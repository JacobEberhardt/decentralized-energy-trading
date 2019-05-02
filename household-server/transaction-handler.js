// This Handler processes the input from the smart meters
module.exports = (req, res) => {
  console.log("Transaction Handler received: ", req);
  const Web3 = require("web3");
  const RpcURL = "";
  const ContractAdress = "";
  const ABI = "";
  const HouseholdAdress = "";

  // instantiate contract and web3
  const web3 = new Web3(RpcURL);
  var contract = new web3.eth.Contract(ABI, ContractAdress);

  // prepare transactions
  var produced = req.produce;
  var consumed = req.consume;

  // sign transactions
  // to be done as we don't have a key yet

  // send transaction
  contract.methods
    .updateRenewableEnergy(HouseholdAdress, produced, consumed)
    .send();
};
