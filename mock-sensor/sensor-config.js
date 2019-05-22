module.exports = {
  /**
   * Consumption and production values which define the daytime differences
   */
  energyConsumption: {
    none: 0,
    low: 20,
    normal: 60,
    high: 100
  },

  energyProduction: {
    none: 0,
    low: 20,
    normal: 60,
    high: 100
  },

  /**
   * Consumption and production values which define the energybalance differences
   */
  regularProductionFactor: {
    pos: 0.6,
    eq: 1.0,
    neg: 1.4
  },

  regularConsumptionFactor: {
    pos: 0.6,
    eq: 1.0,
    neg: 1.4
  }
};
