const debug = require('debug')('pb:services:maker');

const { confirmWithdrawalNotificationContent } = require('../templates');
const { sendNotification } = require('../notification');
const { validateNumber } = require('../utils');
const { Withdrawal } = require('../model');
const { WithdrawalStatus } = require('../constants');
const {
  MAKER_MAX_AMOUNT,
  MAKER_MIN_AMOUNT,
  MAKER_MIN_RANGE,
  MAKER_MAX_RANGE,
} = require('../constants');

async function saveSettings(body, req) {
  try {
    let { user } = req;
    const { minAmount, maxAmount, range } = body;

    validateNumber({
      number: minAmount,
      min: MAKER_MIN_AMOUNT,
      max: MAKER_MAX_AMOUNT,
      fieldName: 'minAmount',
    });

    validateNumber({
      number: maxAmount,
      min: MAKER_MIN_AMOUNT,
      max: MAKER_MAX_AMOUNT,
      fieldName: 'maxAmount',
    });

    validateNumber({
      number: range,
      min: MAKER_MIN_RANGE,
      max: MAKER_MAX_RANGE,
      fieldName: 'range',
    });

    user.maker = {
      ...user.maker,
      minAmount,
      maxAmount,
      range,
    };

    await user.save();

    debug('saved maker settings %o', user);

    return user;
  } catch (err) {
    debug('error while saving maker settings %o', err);
    throw err;
  }
}

async function toggleOnline(body, req) {
  try {
    let { user } = req;
    const { online } = body;

    user.maker.online = online;

    await user.save();

    debug('saved maker settings %o', user);

    return user;
  } catch (err) {
    debug('error while saving maker settings %o', err);
    throw err;
  }
}

async function confirmWithdrawal(body, req) {
  try {
    let { user } = req;
    const { withdrawalId, isApproved } = body;

    const withdrawal = await Withdrawal.findById(withdrawalId)
      .populate('taker')
      .exec();

    withdrawal.maker = user;
    withdrawal.makerLocation = user.location;
    withdrawal.status = isApproved
      ? WithdrawalStatus.MATCHED
      : WithdrawalStatus.CANCELLED;

    debug(
      'Withdrawal status set to %s for withdrawal: %s',
      withdrawal.status,
      withdrawalId
    );

    await withdrawal.save();

    const taker = withdrawal.taker;

    sendNotification({
      contents: {
        en: confirmWithdrawalNotificationContent(
          { amount: withdrawal.amount },
          { language: 'en' }
        ),
        tr: confirmWithdrawalNotificationContent(
          { amount: withdrawal.amount },
          { language: 'tr' }
        ),
      },
      data: {
        userId: taker._id,
        withdrawal,
      },
    });

    return withdrawal;
  } catch (err) {
    debug('error while saving withdrawal request %o', err);
    throw err;
  }
}

module.exports = {
  saveSettings,
  toggleOnline,
  confirmWithdrawal,
};
