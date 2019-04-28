const Utility = artifacts.require("Utility");

contract("Utility", accounts => {
  it("should deploy successfully.", async () => {
    const instance = await Utility.deployed();
    assert(instance);
  });
});
