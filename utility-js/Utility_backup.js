const { ZERO_ADDRESS } = require("../helpers/constants");

const RENEWABLE_ENERGY = "renewableEnergy";
const NONRENEWABLE_ENERGY = "nonRenewableEnergy";

/**
 * Off-chain utility, JS implementation of the utility contracts.
 * Tracks energy production and consumption participating households.
 * Settles energy requests by distributing existing energy as fair as possible (netting).
 */
class Utility {
  constructor() {
    // total produced and consumed renewable energy
    this[RENEWABLE_ENERGY] = 0;
    this[NONRENEWABLE_ENERGY] = 0;
    this.households = {
      // placeholder address
      [ZERO_ADDRESS]: {
        renewableEnergy: 0,
        nonRenewableEnergy: 0,
        meterDelta: 0,
        lastUpdate: Date.now()
      }
    };
    this.deeds = [];
  }

  /**
   * Adds a household to the utility.
   * @param {string} hhAddress Household address to be added
   * @returns {boolean} `false` if household already exists, `true` on success
   */
  addHousehold(hhAddress) {
    if (this._householdExists(hhAddress)) return false;

    this.households[hhAddress] = {
      renewableEnergy: 0,
      nonRenewableEnergy: 0,
      meterDelta: 0,
      lastUpdate: Date.now()
    };

    return true;
  }

  /**
   * Retrieves all deeds from a given household and date.
   * @param {string} hhAddress Household address to return its deeds
   * @param {Date} fromDate Date in the format of Date.now() of the first deed to retrieve
   * @returns {Object} returns an object of deeds
   */
  getDeeds(hhAddress, fromDate = 0) {
    return this._householdExists(hhAddress)
      ? this.deeds
          .filter(deed => deed.date >= fromDate)
          .filter(deed => deed.from === hhAddress || deed.to === hhAddress)
      : [];
  }

  /**
   * Retrieves the energy balances of a given Household.
   * @param {String} hhAddress Household address to return its energy balances
   * @returns {Object} returns an object of {renewableEnergy, nonRenewableEnergy, meterReading, lastUpdate}
   */
  getHousehold(hhAddress) {
    return this._householdExists(hhAddress) ? this.households[hhAddress] : {};
  }

  /**
   * Getter for the global renewable energy balance.
   * @returns {Number} The current value of the global renewable energy
   */
  getRenewableEnergy() {
    return this[RENEWABLE_ENERGY];
  }

  /**
   * Getter for the global non-renewable energy balance.
   * @returns {Number} The current value of the global non-renewable energy
   */
  getNonRenewableEnergy() {
    return this[NONRENEWABLE_ENERGY];
  }

  /**
   * Updates meter reading of a given household.
   * @param {string} hhAddress Address of an existing household
   * @param {number} meterDelta New meter change of household
   * @param {number} timestamp Last update timestamp sent from HHS
   */
  updateMeterDelta(hhAddress, meterDelta, timestamp) {
    if (!this._householdExists(hhAddress)) return false;
    this.households[hhAddress].meterDelta = meterDelta;
    this.households[hhAddress].lastUpdate = timestamp;
    this.updateRenewableEnergy(hhAddress, meterDelta);
  }

  /**
   * Updates a household's renewable energy state.
   * Calls _updateEnergy.
   * @param {string} hhAddress Address of an existing household
   * @param {number} energyDelta Amount of energy to be added to the household's current state
   */
  updateRenewableEnergy(hhAddress, energyDelta) {
    return this._updateEnergy(hhAddress, energyDelta, RENEWABLE_ENERGY);
  }

  /**
   * Updates a household's non-renewable energy state.
   * Calls _updateEnergy.
   * @param {string} hhAddress Address of an existing household
   * @param {number} energyDelta Amount of energy to be added to the household's current state
   */
  updateNonRenewableEnergy(hhAddress, energyDelta) {
    return this._updateEnergy(hhAddress, energyDelta, NONRENEWABLE_ENERGY);
  }

  /**
   * Generic household energy state update method.
   * @param {string} hhAddress Address of an existing household
   * @param {number} energyDelta Amount of energy to be added to the household's current state
   * @param {string} energyType Type of energy. Must be either RENEWABLE_ENERGY or NON_RENEWABLE_ENERGY.
   */
  _updateEnergy(hhAddress, energyDelta, energyType) {
    if (!this._householdExists(hhAddress)) return false;
    this[energyType] += energyDelta;
    this.households[hhAddress][energyType] += energyDelta;
  }

  /**
   * Checks if household exists.
   * @param {string} hhAddress Address of an existing household
   * @returns {boolean} `true`, iff given household exists
   */
  _householdExists(hhAddress) {
    return !!this.households[hhAddress];
  }

  /**
   * Settlement function for netting.
   * Note, this settle function focuses on renewable energy only.
   * @returns {boolean} `true`
   */
  settle() {
    const entries = Object.entries(this.households);
    const withEnergy = entries
      .filter(hh => hh[1].renewableEnergy > 0)
      .map(hh => hh[0]);
    const noEnergy = entries
      .filter(hh => hh[1].renewableEnergy < 0)
      .map(hh => hh[0]);

    let availableEnergy = 0;
    for (let i = 0; i < withEnergy.length; i++) {
      availableEnergy += this.households[withEnergy[i]][RENEWABLE_ENERGY];
    }

    let neededEnergy = 0;
    for (let i = 0; i < noEnergy.length; i++) {
      neededEnergy += this.households[noEnergy[i]][RENEWABLE_ENERGY];
    }

    if (this[RENEWABLE_ENERGY] <= 0) {
      this._proportionalDistribution(
        availableEnergy,
        neededEnergy,
        noEnergy,
        withEnergy
      );
    } else {
      this._proportionalDistribution(
        availableEnergy,
        neededEnergy,
        withEnergy,
        noEnergy
      );
    }

    return true;
  }

  /**
   * Returns all households with positive renewable energy balance.
   * @returns {Array.<string>} Array of addresses of households with positive renewable energy balance
   */
  getHouseholdAddressesWithEnergy() {
    const entries = Object.entries(this.households);
    return entries.filter(hh => hh[1].renewableEnergy > 0).map(hh => hh[0]);
  }

  /**
   * Returns all households with negative renewable energy balance.
   * @returns {Array.<string>} Array of addresses of households with negative renewable energy balance
   */
  getHouseholdAddressesNoEnergy() {
    const entries = Object.entries(this.households);
    return entries.filter(hh => hh[1].renewableEnergy < 0).map(hh => hh[0]);
  }

  /**
   * Distributes renewable energy by proportionally requesting or responding energy such that
   * _neededAvailableEnergy equals 0.
   * @param {number} availableEnergy Available energy. Assumed to be positive.
   * @param {number} neededEnergy Needed renewable energy. Assumed to be negative.
   * @param {Array.<string>} hhFrom Array of addresses {string} with positive renewable energy amount.
   * @param {Array.<string>} hhTo Array of addresses {string} with negative renewable energy amount.
   * @returns {boolean} `true`
   */
  _proportionalDistribution(availableEnergy, neededEnergy, hhFrom, hhTo) {
    const isMoreAvailableThanDemanded = availableEnergy + neededEnergy > 0;

    const energyReference = isMoreAvailableThanDemanded
      ? availableEnergy
      : neededEnergy;

    const energyToShare = isMoreAvailableThanDemanded
      ? neededEnergy
      : availableEnergy;

    let needle = 0;
    let from;
    let to;

    for (let i = 0; i < hhFrom.length; ++i) {
      to = hhFrom[i];

      const proportionalFactor =
        (Math.abs(this.households[to][RENEWABLE_ENERGY]) * 100) /
        Math.abs(energyReference);
      let proportionalShare = Math.round(
        (Math.abs(energyToShare) * proportionalFactor) / 100
      );

      for (let j = needle; j < hhTo.length; ++j) {
        from = hhTo[j];

        const toClaim = isMoreAvailableThanDemanded
          ? proportionalShare * -1
          : proportionalShare;
        const energy = isMoreAvailableThanDemanded
          ? this.households[from][RENEWABLE_ENERGY] * -1
          : this.households[from][RENEWABLE_ENERGY];

        if (energy >= proportionalShare) {
          this._transfer(from, to, toClaim, RENEWABLE_ENERGY);
          this._addDeed(from, to, toClaim, RENEWABLE_ENERGY);
          if (this.households[from][RENEWABLE_ENERGY] === 0) {
            needle++;
          }
          break;
        } else {
          const energyTransferred = this.households[from][RENEWABLE_ENERGY];
          this._transfer(from, to, energyTransferred, RENEWABLE_ENERGY);
          this._addDeed(from, to, energyTransferred, RENEWABLE_ENERGY);
          proportionalShare = proportionalShare - Math.abs(energyTransferred);
          needle++;
        }
      }
    }

    return true;
  }

  /**
   * Adds a new deed.
   * @param {string} from Address of an existing household from where the energy is transferred
   * @param {string} to Address of an existing household to which the energy is transferred
   * @param {number} amount Amount of energy to be transferred
   * @param {string} energyType Type of energy. Must be either RENEWABLE_ENERGY or NON_RENEWABLE_ENERGY.
   */
  _addDeed(from, to, amount, energyType) {
    if (!this._householdExists(from) || !this._householdExists(to))
      return false;

    if (amount < 0) {
      this.deeds.push({
        from: to,
        to: from,
        amount: Math.abs(amount),
        type: energyType,
        date: Date.now()
      });
    } else {
      this.deeds.push({
        from: from,
        to: to,
        amount: amount,
        type: energyType,
        date: Date.now()
      });
    }
  }

  /**
   * Transfer energy from a household address to a household address.
   * @param {string} from Address of an existing household from where the energy is transferred
   * @param {string} to Address of an existing household to which the energy is transferred
   * @param {number} amount Amount of energy to be transferred
   * @param {string} energyType Type of energy. Must be either RENEWABLE_ENERGY or NON_RENEWABLE_ENERGY.
   */
  _transfer(from, to, amount, energyType) {
    if (!this._householdExists(from) || !this._householdExists(to))
      return false;

    this.households[from][energyType] -= amount;
    this.households[to][energyType] += amount;
  }
}

module.exports = Utility;