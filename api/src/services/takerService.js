const debug = require('debug')('pb:services:taker');
const _ = require('lodash');
const bluebird = require('bluebird');
const { Withdrawal, Taker } = bluebird.promisifyAll(require('../model'));
const { WithdrawalStatus, MAXIMUM_WITHDRAWAL_AMOUNT } = require('../constants');
const { latLngToPoint } = require('../utils');
const { findMaker } = require('../queue');

async function createWithdrawal(body, params) {
  const { deviceId } = params;
  const { amount } = body;

  if (!_.isFinite(amount) || amount > MAXIMUM_WITHDRAWAL_AMOUNT) {
    debug(
      'Requested withdrawal amount is more than allowed %d amount',
      MAXIMUM_WITHDRAWAL_AMOUNT
    );

    throw new Error();
  }

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
