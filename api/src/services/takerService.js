const debug = require('debug')('pb:services:taker');

const { Withdrawal } = require('../model');
const {
  WithdrawalStatus,
  TAKER_MIN_AMOUNT,
  TAKER_MAX_AMOUNT,
  DEFAULT_LOCATION,
} = require('../constants');
const { validateNumber, latLngToPoint } = require('../utils');
const { findMaker } = require('../queue');

async function createWithdrawal(body, req) {
  const { user } = req;
  const { amount } = body;

  validateNumber({
    number: amount,
    min: TAKER_MIN_AMOUNT,
    max: TAKER_MAX_AMOUNT,
    fieldName: 'amount',
  });

  const withdrawal = new Withdrawal({
    status: WithdrawalStatus.PENDING,
    amount,
    taker: user,
    takerLocation: user.location || latLngToPoint(...DEFAULT_LOCATION),
  });

  await withdrawal.save();

  debug('Created a new withdrawal for %s', user.id);

  const job = await findMaker
    .createJob({
      withdrawalId: withdrawal.id,
    })
    .retries(5)
    .backoff('exponential', 1000)
    .save();

  debug('Created a findMaker job with the id %d', job.id);

  return withdrawal;
}

module.exports = {
  createWithdrawal,
};
