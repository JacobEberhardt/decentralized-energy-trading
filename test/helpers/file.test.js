const chai = require("chai");

const fileHelper = require("../../helpers/file");

const { assert } = chai;

describe("helpers/file", () => {
  describe("#readFileSync", () => {
    it("should resolve relative file path", () => {
      const text = fileHelper.readFileSync("./test/helpers/test.txt");
      assert.strictEqual(text, "test");
    });
  });
});
