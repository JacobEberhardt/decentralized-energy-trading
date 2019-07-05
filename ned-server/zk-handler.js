const shell = require("shelljs");
const web3Utils = require("web3-utils");

const { enforceAddressArrLength } = require("../helpers/address-arr");
const { kWhToWs } = require("../helpers/conversion");

/**
 * This handler manages the communication of the NED Server and the ZoKrates environment
 */
module.exports = {
  generateProof: (utilityBeforeNetting, utilityAfterNetting) => {
    const hhAddressesWithEnergyBefore = enforceAddressArrLength(
      utilityBeforeNetting.getHouseholdAddressesWithEnergy()
    );
    const hhAddressesNoEnergyBefore = enforceAddressArrLength(
      utilityBeforeNetting.getHouseholdAddressesNoEnergy()
    );
    const balancesBefore = [
      ...hhAddressesWithEnergyBefore,
      ...hhAddressesNoEnergyBefore
    ].map(address =>
      kWhToWs(utilityBeforeNetting.households[address].renewableEnergy)
    );
    const balancesAfter = [
      ...hhAddressesWithEnergyBefore,
      ...hhAddressesNoEnergyBefore
    ].map(address =>
      kWhToWs(Math.abs(utilityAfterNetting.households[address].renewableEnergy))
    );
    const shellStr = shell
      .cd("./zokrates-code")
      .exec(
        `zokrates compute-witness -a ${balancesBefore.join(
          " "
        )} ${balancesAfter.join(" ")}`
      )
      .grep("--", "^~out_*");

    if (shellStr.code !== 0) {
      throw new Error("zokrates compute-witness failed");
    }

    const hashArr = shellStr.stdout.split("\n").filter(str => str);
    const hashOut0 = hashArr
      .find(hashPart => hashPart.indexOf("~out_0 ") !== -1)
      .substr(7);
    const hashOut1 = hashArr
      .find(hashPart => hashPart.indexOf("~out_1 ") !== -1)
      .substr(7);
    const hashOut0Hex = web3Utils.toBN(hashOut0).toString("hex");
    const hashOut1Hex = web3Utils.toBN(hashOut1).toString("hex");

    if (shell.exec("zokrates generate-proof").code !== 0) {
      throw new Error("zokrates generate-proof failed");
    }

    return `0x${hashOut0Hex}${hashOut1Hex}`;
  }
};
