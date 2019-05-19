const OwnedSet = artifacts.require("OwnedSet");
const web3Helper = require("../helpers/web3");
const authorityHelper = require("../helpers/authority");

module.exports = async (deployer, network) => {
  if (network === "authority") {
    const web3 = web3Helper.initWeb3("authority");
    const { address, password } = authorityHelper.getAddressAndPassword();
    await web3.eth.personal.unlockAccount(address, password, null);
    await deployer.deploy(OwnedSet, address, [address]);
  }
};
