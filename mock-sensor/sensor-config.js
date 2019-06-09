module.exports = {
  /**
   * Consumption and production values which define the daytime differences
   */
  energyConsumption: {
    none: 0,
    low: 20,
    normal: 60,
    high: 80
  },

  energyProduction: {
    none: 0,
    low: 20,
    normal: 60,
    high: 80
  },

  /**
   * Consumption and production values which define the energybalance differences
   */
  regularProductionFactor: {
    pos: 1.8,
    eq: 1.0,
    neg: 0.2
  },

  regularConsumptionFactor: {
    pos: 0.2,
    eq: 1.0,
    neg: 1.8
  }
};
