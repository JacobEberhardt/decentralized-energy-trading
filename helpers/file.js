const fs = require("fs");
const path = require("path");

module.exports = {
  /**
   * Synchronously reads file from given path.
   * @param {string} filePath Path to read file from.
   */
  readFileSync: filePath => {
    const options = {
      encoding: "utf-8",
      flag: "r"
    };
    return fs.readFileSync(path.resolve(filePath), options);
  }
};
