const chai = require("chai");

const { ZERO_ADDRESS } = require("../../helpers/constants");
const addressArrHelper = require("../../helpers/address-arr");

const { assert } = chai;

describe("helpers/address-arr", () => {
  describe("#enforceAddressArrLength", () => {
    it("should fill empty address array", () => {
      assert.deepEqual(addressArrHelper.enforceAddressArrLength([]), [
        ZERO_ADDRESS,
        ZERO_ADDRESS
      ]);
    });
    it("should slice too long address array", () => {
      assert.deepEqual(
        addressArrHelper.enforceAddressArrLength(["0xa", "0xb", "0xc"]),
        ["0xa", "0xb"]
      );
    });
  });
});
