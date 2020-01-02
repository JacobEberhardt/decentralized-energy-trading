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
    this[RENEWABLE_ENERGY] = 0;
    this[NONRENEWABLE_ENERGY] = 0;
    this.households = {
      // placeholder address
      [ZERO_ADDRESS]: {
        meterDelta: 0,
        lastUpdate: Date.now()
      }
    };
    this.transfers = [];
  }

  /**
   * Adds a household to the utility.
   * @param {string} hhAddress Household address to be added
   * @returns {boolean} `false` if household already exists, `true` on success
   */
  addHousehold(hhAddress) {
    if (this._householdExists(hhAddress)) return false;

    this.households[hhAddress] = {
      meterDelta: 0,
      lastUpdate: Date.now()
    };

    return true;
  }

  /**
   * Retrieves all transfers from a given household and date.
   * @param {string} hhAddress Household address to return its transfers
   * @param {number} fromDate Date in the format of Date.now() of the first transfer to retrieve
   * @returns {Object} returns an object of transfers
   */
  getTransfers(hhAddress, fromDate = 0) {
    return this._householdExists(hhAddress)
      ? this.transfers
          .filter(transfer => transfer.date >= fromDate)
          .filter(transfer => transfer.from === hhAddress || transfer.to === hhAddress)
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
    this.households[hhAddress].meterDelta = Number(meterDelta);
    this.households[hhAddress].lastUpdate = timestamp;
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
   * @returns {{ [x: string]: { meterDelta: number, lastUpdate: number } }} this.households
   */
  settle() {
    delete this.households[ZERO_ADDRESS];
    let households = this._getProducersConsumers();
    // update network wide stats for netting
    if (households.isMoreAvailableThanDemanded) {
      this._updateNetworkStats(households.eTo, 0);
    } else {
      const nonRenewable = Math.abs(households.eFrom + households.eTo);
      this._updateNetworkStats(households.eFrom, nonRenewable);
    }
    this._proportionalDistribution(
      households.hFrom,
      households.eFrom,
      households.hTo,
      households.eTo,
      false
    );

    // updating data for transfer of remaining deltas
    households = this._getProducersConsumers();
    this._transferRest(
      households.hFrom,
      households.hTo,
      households.isMoreAvailableThanDemanded
    );

    return this.households;
  }

  /**
   * Function for returning hh (producers and consumers) and their groups delta
   */
  _getProducersConsumers() {
    const entries = Object.entries(this.households);
    const withEnergy = entries
      .filter(hh => hh[1].meterDelta > 0)
      .map(hh => hh[0]);
    const noEnergy = entries
      .filter(hh => hh[1].meterDelta < 0)
      .map(hh => hh[0]);
    let deltaProducers = 0;
    for (let i = 0; i < withEnergy.length; i++) {
      deltaProducers += Number(this.households[withEnergy[i]].meterDelta);
    }

    let deltaConsumers = 0;
    for (let i = 0; i < noEnergy.length; i++) {
      deltaConsumers += Number(this.households[noEnergy[i]].meterDelta);
    }

    let isMoreAvailableThanDemanded = deltaProducers > Math.abs(deltaConsumers);

    if (isMoreAvailableThanDemanded) {
      return { "hFrom": noEnergy, "eFrom": deltaConsumers, "hTo": withEnergy, "eTo": deltaProducers, "isMoreAvailableThanDemanded": isMoreAvailableThanDemanded };
    } else {
      return { "hFrom": withEnergy, "eFrom": deltaProducers, "hTo": noEnergy, "eTo": deltaConsumers, "isMoreAvailableThanDemanded": isMoreAvailableThanDemanded }
    }
  }

  /**
   * Returns all households with positive renewable energy balance.
   * @returns {Array.<string>} Array of addresses of households with positive renewable energy balance
   */
  getHouseholdAddressesWithEnergy() {
    delete this.households[ZERO_ADDRESS];
    const entries = Object.entries(this.households);
    return entries.filter(hh => hh[1].meterDelta >= 0).map(hh => hh[0]);
  }

  /**
   * Returns all households with negative renewable energy balance.
   * @returns {Array.<string>} Array of addresses of households with negative renewable energy balance
   */
  getHouseholdAddressesNoEnergy() {
    const entries = Object.entries(this.households);
    return entries.filter(hh => hh[1].meterDelta < 0).map(hh => hh[0]);
  }

  /**
   * Distributes renewable energy by proportionally requesting or responding energy such that
   * _neededAvailableEnergy equals 0.
   * @param {Array.<string>} hFrom Array of addresses {string}from where energy is sent.
   * @param {number} eFrom Total to be sent
   * @param {Array.<string>} hTo Array of addresses {string} to where energy is sent.
   * @param {number} eTo Total required (always <= eFrom)
   * @param {boolean} isMoreAvailableThanDemanded
   * @returns {boolean} `true`
   */
  _proportionalDistribution(hFrom, eFrom, hTo, eTo, isMoreAvailableThanDemanded){
    for (let i = 0; i < hTo.length; i++) {
      let eAlloc = Math.round(eFrom * (this.households[hTo[i]].meterDelta / eTo));
      for (let j = 0; j < hFrom.length; j++) {
        if (eAlloc != 0) {
          if (Math.abs(eAlloc) <= Math.abs(this.households[hFrom[j]].meterDelta)) {
            this._transfer(hFrom[j], hTo[i], eAlloc)
            this._addTransfer(hFrom[j], hTo[i], eAlloc, isMoreAvailableThanDemanded)
            eAlloc = 0;
          } else {
            let toTransfer = this.households[hFrom[j]].meterDelta
            if(toTransfer != 0){
              this._transfer(hFrom[j], hTo[i], toTransfer, isMoreAvailableThanDemanded)
              this._addTransfer(hFrom[j], hTo[i], toTransfer, isMoreAvailableThanDemanded)
              eAlloc -= toTransfer;
            }
          }
        }
      }
    }
    return true;
  }

  /**
   * Randomly distributes rest meterDelta so one side is always 0. Will speed up verification time a lot
   * @param {[string]} hFrom Address of an existing household from where the energy is transferred
   * @param {[string]} hTo Address of an existing household to which the energy is transferred
   * @param {boolean} isMoreAvailableThanDemanded over or underproduction?
   */
  _transferRest(hFrom, hTo, isMoreAvailableThanDemanded) {
    let indices = hTo.map((x, i) => i);
    for (let i = 0; i < hFrom.length; i++) {
      while (this.households[hFrom[i]].meterDelta != 0) {
        let randomIndice = Math.floor(Math.random() * indices.length);
        let toTransfer = isMoreAvailableThanDemanded ? -1 : 1;
        this._transfer(hFrom[i], hTo[randomIndice], toTransfer);
        indices.splice(randomIndice, 1);
      }
    }
  }

  /**
   * Updates globals for each netting
   * @param {number} renewableEnergy amount of renewable energy produced in this neting interval
   * @param {number} nonRenewableEnergy amount of non renewable energy that has been bought from grid
   */
  _updateNetworkStats(renewableEnergy, nonRenewableEnergy) {
    this[RENEWABLE_ENERGY] += renewableEnergy;
    this[NONRENEWABLE_ENERGY] += nonRenewableEnergy;
  }

  /**
   * Adds a new transfer.
   * @param {string} from Address of an existing household from where the energy is transferred
   * @param {string} to Address of an existing household to which the energy is transferred
   * @param {number} amount Amount of energy to be transferred
   * @param {string} mode Type of energy. Must be either RENEWABLE_ENERGY or NON_RENEWABLE_ENERGY.
   */
  _addTransfer(from, to, amount, mode) {
    if (!this._householdExists(from) || !this._householdExists(to)) {
      return false;
    }

    if (mode) {
      this.transfers.push({
        from: from,
        to: to,
        amount: Math.abs(amount),
        date: Date.now()
      });
    } else {
      this.transfers.push({
        from: to,
        to: from,
        amount: Math.abs(amount),
        date: Date.now()
      });
    }
  }

  /**
   * Transfer energy from a household address to a household address.
   * @param {string} from Address of an existing household from where the energy is transferred
   * @param {string} to Address of an existing household to which the energy is transferred
   * @param {number} amount Amount of energy to be transferred
   */
  _transfer(from, to, amount) {
    if (!this._householdExists(from) || !this._householdExists(to)) {
      return false;
    }
    this.households[from].meterDelta -= amount;
    this.households[to].meterDelta += amount;
  }
}

module.exports = Utility;
