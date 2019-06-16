const RENEWABLE_ENERGY = "renewableEnergy";
const NONRENEWABLE_ENERGY = "nonRenewableEnergy";

/**
 * Offchain utility.
 */
class Utility {
  constructor() {
    // total produced and consumed renewable energy
    this[RENEWABLE_ENERGY] = 0;
    this[NONRENEWABLE_ENERGY] = 0;
    this.households = {};
  }

  /**
   * Adds a household to the utility.
   *
   * @param {number} hhAddress Household address to be added
   * @returns {boolean} `false` if household already exists, `true` on success
   */
  addHousehold(hhAddress) {
    if (this._householdExists(hhAddress)) return false;

    this.households[hhAddress] = {
      renewableEnergy: 0,
      nonRenewableEnergy: 0
    };

    return true;
  }

  /**
   * Updates a household's renewable energy state.
   *
   * Calls _updateEnergy.
   *
   * @param {number} hhAddress Address of an existing household
   * @param {number} energyDelta Amount of energy to be added to the household's current state
   */
  updateRenewableEnergy(hhAddress, energyDelta) {
    return this._updateEnergy(hhAddress, energyDelta, RENEWABLE_ENERGY);
  }

  /**
   * Updates a household's non-renewable energy state.
   *
   * Calls _updateEnergy.
   *
   * @param {number} hhAddress Address of an existing household
   * @param {number} energyDelta Amount of energy to be added to the household's current state
   */
  updateNonRenewableEnergy(hhAddress, energyDelta) {
    return this._updateEnergy(hhAddress, energyDelta, NONRENEWABLE_ENERGY);
  }

  /**
   * Generic household energy state update method.
   *
   * @param {number} hhAddress Address of an existing household
   * @param {number} energyDelta Amount of energy to be added to the household's current state
   * @param {string} energyType Type of energy. Must be either RENEWABLE_ENERGY or NON_RENEWABLE_ENERGY
   */
  _updateEnergy(hhAddress, energyDelta, energyType) {
    if (!this._householdExists(hhAddress)) return false;
    this[energyType] += energyDelta;
    this.households[hhAddress][energyType] += energyDelta;
  }

  /**
   * @param {number} hhAddress Address of an existing household
   * @returns {boolean} `true`, iff given household exists
   */
  _householdExists(hhAddress) {
    return !!this.households[hhAddress];
  }
}

module.exports = new Utility();
