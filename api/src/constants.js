const WithdrawalStatus = {
  PENDING: 'pending',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
};

const TAKER_MIN_AMOUNT = 100;
const TAKER_MAX_AMOUNT = 1000;

const MAKER_MIN_AMOUNT = 100;
const MAKER_MAX_AMOUNT = 1000;
const MAKER_MIN_RANGE = 0;
const MAKER_MAX_RANGE = 5000;

const DEFAULT_LOCATION = [41.080635, 29.017626];

module.exports = {
  WithdrawalStatus,
  TAKER_MIN_AMOUNT,
  TAKER_MAX_AMOUNT,
  MAKER_MIN_AMOUNT,
  MAKER_MAX_AMOUNT,
  MAKER_MIN_RANGE,
  MAKER_MAX_RANGE,
  DEFAULT_LOCATION,
};
