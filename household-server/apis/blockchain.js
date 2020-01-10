const web3Helper = require('../../helpers/web3');
const contractHelper = require('../../helpers/contract');

module.exports = {
    /**
    * retrieves meterDeltaHash after netting for specific household 
    * @param {String} network Web3 instance.
    * @param {String} address web3 contract instance.
    * @param {string} password Current meter change in kWh.
    */
    getAfterNettingHash: async (network, address, password) => {
        web3 = web3Helper.initWeb3(network);

        utilityContract = new web3.eth.Contract(
            contractHelper.getAbi("dUtility"),
            contractHelper.getDeployedAddress("dUtility", await web3.eth.net.getId())
        );

        await web3.eth.personal.unlockAccount(
            address,
            password,
            null
        );
        return await utilityContract.methods
            .getHouseholdAfterNettingHash(address)
            .call({ from: address, gas: 60000000 })
            .then(res => {
                return res
            });
    }
}