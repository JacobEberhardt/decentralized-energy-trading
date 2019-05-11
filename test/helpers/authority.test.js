const chai = require("chai");
const web3Utils = require("web3-utils");

const authorityHelper = require("../../helpers/authority");

const { assert } = chai;

describe("helpers/authority", () => {
  describe("#getAddressAndPassword", () => {
    it("should return valid ethereum address", () => {
      const { address } = authorityHelper.getAddressAndPassword();
      assert.isOk(web3Utils.isAddress(address));
    });

    it("should return password string", () => {
      const { password } = authorityHelper.getAddressAndPassword();
      assert.isString(password);
    });
  });
});
