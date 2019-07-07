const chai = require("chai");

const conversionHelper = require("../../helpers/conversion");

const { assert } = chai;

describe("helpers/conversion", () => {
  describe("#kWhToWs", () => {
    it("should convert 1 kWh to 3600000 Ws", () => {
      assert.strictEqual(conversionHelper.kWhToWs(1), "3600000");
    });
    it("should convert and round 1.000000000001", () => {
      assert.strictEqual(conversionHelper.kWhToWs(1), "3600000");
    });
  });
  describe("#wsToKWh", () => {
    it("should convert 3600000 Ws to 1 kWh", () => {
      assert.strictEqual(conversionHelper.wsToKWh(3600000), 1);
    });
  });
});
