const shell = require("shelljs");
const web3Utils = require("web3-utils");

const addressHelper = require("../helpers/address-arr");
const zokratesHelper = require("../helpers/zokrates");

/**
 * This handler manages the communication of the NED Server and the ZoKrates environment
 */
module.exports = {
  generateProof: (utilityBeforeNetting, utilityAfterNetting) => {
    const hhAddressesWithEnergyBefore = addressHelper.enforceAddressArrLength(
      utilityBeforeNetting.getHouseholdAddressesWithEnergy(),
      2
    );
    const hhAddressesNoEnergyBefore = addressHelper.enforceAddressArrLength(
      utilityBeforeNetting.getHouseholdAddressesNoEnergy(),
      2
    );
    const balancesBefore = [
      ...hhAddressesWithEnergyBefore,
      ...hhAddressesNoEnergyBefore
    ]
      .map(address => utilityBeforeNetting.households[address].renewableEnergy)
      .join(" ");
    const balancesAfter = [
      ...hhAddressesWithEnergyBefore,
      ...hhAddressesNoEnergyBefore
    ]
      .map(address =>
        Math.abs(utilityAfterNetting.households[address].renewableEnergy)
      )
      .join(" ");

    const packedParams = [
      ...hhAddressesWithEnergyBefore,
      ...hhAddressesNoEnergyBefore
    ]
      .map(address => {
        const packedParamsOfHH = zokratesHelper.padPackParams512(
          utilityBeforeNetting.households[address].meterReading,
          utilityBeforeNetting.households[address].lastUpdate,
          address
        );
        return [
          web3Utils.hexToNumberString(packedParamsOfHH.substr(2, 32)),
          web3Utils.hexToNumberString(packedParamsOfHH.substr(34, 3)),
          web3Utils.hexToNumberString(packedParamsOfHH.substr(66, 32)),
          web3Utils.hexToNumberString(packedParamsOfHH.substr(98, 32))
        ].join(" ");
      })
      .join(" ");

    console.log("Computing witness...");
    const witnessShellStr = shell
      .cd("./zokrates-code")
      .exec(
        `zokrates compute-witness -a ${balancesBefore} ${balancesAfter} ${packedParams} > /dev/null`
      )
      .grep("--", "^~out_*", "witness");

    if (witnessShellStr.code !== 0) {
      throw new Error("zokrates compute-witness failed");
    }

    const hashArr = witnessShellStr.stdout
      .split("\n")
      .filter(str => str)
      .sort((a, b) => (a.charAt[5] < b.charAt[5] ? 1 : -1));
    const hashOutHex = hashArr.reduce((hashes, hashPart, i) => {
      if (i % 2 !== 0) {
        return hashes;
      }
      const hashOut0 = hashArr[i].substr(7);
      const hashOut1 = hashArr[i + 1].substr(7);
      const hashHex = `0x${web3Utils
        .toBN(hashOut0)
        .toString("hex")}${web3Utils.toBN(hashOut1).toString("hex")}`;
      hashes.push(hashHex);
      return hashes;
    }, []);

    console.log("Generating proof...");
    const proofShellStr = shell.exec("zokrates generate-proof > /dev/null");

    if (proofShellStr.code !== 0) {
      throw new Error("zokrates generate-proof failed");
    }

    return hashOutHex;
  }
};
