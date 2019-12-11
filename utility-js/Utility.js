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
    this.households = {
      // placeholder address
      [ZERO_ADDRESS]: {
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
   * @returns {boolean} `true`
   */
  settle() {
    delete this.households[ZERO_ADDRESS];
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
    this._proportionalDistribution(
      deltaProducers,
      deltaConsumers,
      withEnergy,
      noEnergy
    );

    return this.households;
  }

  /**
   * Returns all households with positive renewable energy balance.
   * @returns {Array.<string>} Array of addresses of households with positive renewable energy balance
   */
  getHouseholdAddressesWithEnergy() {
    delete this.households[ZERO_ADDRESS]
    const entries = Object.entries(this.households);
    //console.log("With Energy: ", entries);
    return entries.filter(hh => hh[1].meterDelta >= 0).map(hh => hh[0]);
  }

  /**
   * Returns all households with negative renewable energy balance.
   * @returns {Array.<string>} Array of addresses of households with negative renewable energy balance
   */
  getHouseholdAddressesNoEnergy() {
    const entries = Object.entries(this.households);
    //console.log("No Energy: ", entries);
    let bla = entries.filter(hh => hh[1].meterDelta < 0).map(hh => hh[0]);
    return bla

    // return entries.filter(hh => hh[1].meterDelta < 0).map(hh => hh[0]);
  }

  /**
   * Distributes renewable energy by proportionally requesting or responding energy such that
   * _neededAvailableEnergy equals 0.
   * @param {number} deltaProducers meterDelta of all Producers. Assumed to be positive
   * @param {number} deltaConsumers meterDelta of all consumers. Assumed to be negative.
   * @param {Array.<string>} hhFrom Array of addresses {string} with positive renewable energy amount.
   * @param {Array.<string>} hhTo Array of addresses {string} with negative renewable energy amount.
   * @returns {boolean} `true`
   */
  _propDistro(deltaProducers, deltaConsumers, hhFrom, hhTo) {
    if(deltaConsumers == 0) return true //No need for netting when nothing has been consumed

    // if (Math.abs(es) < Math.abs(ep)) {
    //   hFrom = hs;
    //   eFrom = es;
    //   hTo = hp;
    //   eTo = ep;
    // } else {
    //   hFrom = hp;
    //   eFrom = ep;
    //   hTo = hs;
    //   eTo = es;
    // }

    const isMoreAvailableThanDemanded = deltaProducers > deltaConsumers;
   
    const ratioConsumers = hhTo.map(obj => Math.floor((Math.abs(this.households[obj].meterDelta) / deltaConsumers) * 1000000) / 1000000);
    const energyReference = isMoreAvailableThanDemanded ? deltaProducers : deltaConsumers;

    for (let i = 0; i < hhFrom.length; i++) {

      let proportionalRatio = this.households[hhFrom[i]].meterDelta / energyReference;
      let shareProducer = Math.floor(Math.abs(deltaConsumers) * proportionalRatio);
      
      for (let j = 0; j < hhTo.length; j++) {
        let toTransfer = Math.floor(shareProducer * ratioConsumers[j])
        this._transfer(hhFrom[i], hhTo[j], toTransfer);
        this._addDeed(hhFrom[i], hhTo[j], toTransfer);
      }
    }
    return true;
  };

  /**
  * Distributes renewable energy by proportionally requesting or responding energy such that
  * _neededAvailableEnergy equals 0.
  * @param {number} deltaProducers meterDelta of all Producers. Assumed to be positive
  * @param {number} deltaConsumers meterDelta of all consumers. Assumed to be negative.
  * @param {Array.<string>} hhFrom Array of addresses {string} with positive renewable energy amount.
  * @param {Array.<string>} hhTo Array of addresses {string} with negative renewable energy amount.
  * @returns {boolean} `true`
  */
  _proportionalDistribution(deltaProducers, deltaConsumers, hhFrom, hhTo){
    if (deltaConsumers == 0) return true //No need for netting when nothing has been consumed
    const isMoreAvailableThanDemanded = deltaProducers > Math.abs(deltaConsumers);
    let hFrom;
    let eFrom;
    let hTo;
    let eTo;
    let eAlloc;
    if (isMoreAvailableThanDemanded) {
      hFrom = hhTo;
      eFrom = deltaConsumers;
      hTo = hhFrom;
      eTo = deltaProducers;
    } else {
      hFrom = hhFrom;
      eFrom = deltaProducers;
      hTo = hhTo;
      eTo = deltaConsumers;
    }

    for (let i = 0; i < hTo.length; i++) {
      eAlloc = Math.round(eFrom * (this.households[hTo[i]].meterDelta / eTo));
      for (let j = 0; j < hFrom.length; j++) {
        if (eAlloc != 0) {
          if (Math.abs(eAlloc) <= Math.abs(this.households[hFrom[j]].meterDelta)) {
            this._transfer(hFrom[j], hTo[i], eAlloc)
            this._addDeed(hFrom[j], hTo[i], eAlloc, isMoreAvailableThanDemanded)
            eAlloc = 0;
          } else {
            let toTransfer = this.households[hFrom[j]].meterDelta
            this._transfer(hFrom[j], hTo[i], toTransfer, isMoreAvailableThanDemanded)
            this._addDeed(hFrom[j], hTo[i], toTransfer, isMoreAvailableThanDemanded)
            eAlloc -= toTransfer;
          }
        }
      }
    }
    console.log(this.deeds)
    return true;
  }

  /**
   * Adds a new deed.
   * @param {string} from Address of an existing household from where the energy is transferred
   * @param {string} to Address of an existing household to which the energy is transferred
   * @param {number} amount Amount of energy to be transferred
   * @param {string} energyType Type of energy. Must be either RENEWABLE_ENERGY or NON_RENEWABLE_ENERGY.
   */
  _addDeed(from, to, amount, mode){
    if (!this._householdExists(from) || !this._householdExists(to))
      return false;

    
    if(mode){
      this.deeds.push({
        from: to,
        to: from,
        amount: Math.abs(amount),
        date: Date.now()
      });
    } else {
      this.deeds.push({
        from: from,
        to: to,
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
   * @param {string} energyType Type of energy. Must be either RENEWABLE_ENERGY or NON_RENEWABLE_ENERGY.
   */
  _transfer(from, to, amount) {
    if (!this._householdExists(from) || !this._householdExists(to)){
      return false;

    }
    this.households[from].meterDelta -= amount;
    this.households[to].meterDelta += amount;
  }
}

module.exports = Utility;