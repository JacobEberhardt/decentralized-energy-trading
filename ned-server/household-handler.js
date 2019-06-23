const web3Utils = require("web3-utils");

module.exports = {
  isValidatorAddress: async (ownedSetContact, householdAddress) => {
    const validators = await ownedSetContact.methods.getValidators().call();
    return (
      validators.indexOf(web3Utils.toChecksumAddress(householdAddress)) === -1
    );
  }
};
