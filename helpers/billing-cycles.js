function getBillingPeriod(billingInterval, timestampMs) {
  if (!timestampMs) timestampMs = Date.now();
  return Math.floor(timestampMs / billingInterval);
}

module.exports = {
  getBillingPeriod,
}
