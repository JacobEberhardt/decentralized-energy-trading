module.exports = {
  /**
   * Returns address and password of household / authority from respective parity files.
   * NOTE: Hardcoded until setup ready.
   */
  getAddressAndPassword: () => {
    // TODO: Read address and password from `./parity-authority once properly setup`
    const address = "0x90f8bf6a479f320ead074411a4b0e7944ea8c9c1";
    const password = "";
    return {
      address,
      password
    };
  }
};
