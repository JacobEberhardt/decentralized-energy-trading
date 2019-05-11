const fs = require("fs");
const path = require("path");

/**
 * This module contains helper functions that are related to the filesystem.
 */
module.exports = {
  /**
   * Synchronously reads file from given path.
   * @param {string} filePath Path to read file from.
   * @returns {string} Parsed text from given file.
   */
  readFileSync: filePath => {
    const options = {
      encoding: "utf-8",
      flag: "r"
    };
    return fs.readFileSync(path.resolve(filePath), options);
  }
};
