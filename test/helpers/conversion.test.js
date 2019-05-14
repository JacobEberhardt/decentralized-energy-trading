const chai = require("chai");

const conversionHelper = require("../../helpers/conversion");

const { assert } = chai;

describe("helpers/conversion", () => {
  describe("#kWhToWs", () => {
    it("should convert 1 kWh to 3600000 Ws", () => {
      assert.strictEqual(conversionHelper.kWhToWs(1), "3600000");
    });
  });
});
