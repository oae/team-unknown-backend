const debug = require('debug')('pb:services:taker');

const { sendNotification } = require('../notification');
const { Withdrawal } = require('../model');
const { withdrawalNotificationContent } = require('../templates');

const {
  WithdrawalStatus,
  TAKER_MIN_AMOUNT,
  TAKER_MAX_AMOUNT,
} = require('../constants');
const { validateNumber, latLngToPoint } = require('../utils');
const { findMaker } = require('../queue');

async function createWithdrawal(body, req) {
  const { user } = req;
  const { amount, location } = body;

  validateNumber({
    number: amount,
    min: TAKER_MIN_AMOUNT,
    max: TAKER_MAX_AMOUNT,
    fieldName: 'amount',
  });

  const withdrawal = new Withdrawal({
    status: WithdrawalStatus.MATCHING,
    amount,
    taker: user,
    takerLocation: latLngToPoint(...location),
  });

  await withdrawal.save();
  debug('Created a new withdrawal for %s', user.id);

  user.location = latLngToPoint(...location);
  await user.save();
  debug('Updated user location.');

  const job = await findMaker
    .createJob({
      withdrawalId: withdrawal.id,
    })
    .retries(5)
    .backoff('exponential', 1000)
    .save();

  job.on('succeeded', maker => {
    sendNotification({
      contents: {
        en: withdrawalNotificationContent(
          { distance: maker.distance, amount: withdrawal.amount },
          { language: 'en' }
        ),
        tr: withdrawalNotificationContent(
          { distance: maker.distance, amount: withdrawal.amount },
          { language: 'tr' }
        ),
      },
      data: {
        userId: maker._id,
        withdrawal,
      },
    });
  });

  debug('Created a findMaker job with the id %d', job.id);

  return withdrawal;
}

module.exports = {
  createWithdrawal,
};
