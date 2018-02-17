const debug = require('debug')('pb:services:maker');

const { validateNumber } = require('../utils');
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
      minAmount,
      maxAmount,
      range,
    };

    await user.saveAsync();

    debug('saved maker settings %o', user);

    return user;
  } catch (err) {
    debug('error while saving maker settings %o', err);
    throw err;
  }
}

module.exports = {
  saveSettings,
};
