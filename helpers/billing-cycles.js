function getBillingPeriod(
  billingInterval,
  timestampMs,
  timestampFirstBillingPeriodSec = 0
) {
  if (!timestampMs) timestampMs = Date.now();
  return Math.floor(
    (timestampMs - timestampFirstBillingPeriodSec * 1000) / billingInterval
  );
}

function isTimestampBeforeSubmissionDeadline(
  timestampMs,
  billingPeriod,
  billingInterval,
  submissionDeadlineBillingEpoch = 15 * 60 + 15 * 60 // 15min (nettingInterval) plus 15min tolerance after end of billing period
) {
  if (!timestampMs) timestampMs = Date.now();
  const maxSubmissionPeriod = Math.floor(
    (timestampMs - submissionDeadlineBillingEpoch * 1000) / billingInterval
  );
  return maxSubmissionPeriod <= billingPeriod;
}

module.exports = {
  getBillingPeriod,
  isTimestampBeforeSubmissionDeadline,
};
