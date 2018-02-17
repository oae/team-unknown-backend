const debug = require('debug')('pb:services:taker');
const bluebird = require('bluebird');

const { Withdrawal, Taker } = bluebird.promisifyAll(require('../model'));
const {
  WithdrawalStatus,
  TAKER_MIN_AMOUNT,
  TAKER_MAX_AMOUNT,
} = require('../constants');
const { latLngToPoint, validateNumber } = require('../utils');
const { findMaker } = require('../queue');

async function createWithdrawal(body, params) {
  const { deviceId } = params;
  const { amount } = body;

  validateNumber({
    number: amount,
    min: TAKER_MIN_AMOUNT,
    max: TAKER_MAX_AMOUNT,
    fieldName: 'amount',
  });

  const taker = await Taker.findOneAsync({ deviceId });

  const withdrawal = new Withdrawal({
    status: WithdrawalStatus.PENDING,
    amount,
    taker,
  });

  await withdrawal.saveAsync();

  debug('Created a new withdrawal for %s', deviceId);

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

async function register(body, params) {
  const { deviceId } = params;
  const { lat, lng } = body;

  const taker = new Taker({
    deviceId,
    location: latLngToPoint(lat, lng),
  });

  await taker.saveAsync();

  debug('created a new taker with id %s', deviceId);

  return taker;
}

module.exports = {
  createWithdrawal,
  register,
};
