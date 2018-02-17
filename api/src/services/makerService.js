const debug = require('debug')('pb:services:maker');

const { MakerNotFoundError } = require('../errors');
const { latLngToPoint, validateNumber } = require('../utils');
const { Maker } = require('../model');
const {
  MAKER_MAX_AMOUNT,
  MAKER_MIN_AMOUNT,
  MAKER_MIN_RANGE,
  MAKER_MAX_RANGE,
} = require('../constants');

async function register(body, params) {
  const { deviceId } = params;
  const { location: { lat, lng } } = body;

  let maker = new Maker({
    deviceId,
    location: latLngToPoint(lat, lng),
  });

  maker = await maker.saveAsync();

  debug('created a new maker with id %s', deviceId);

  return maker;
}

async function saveSettings(body, params) {
  try {
    const { deviceId } = params;
    const { minAmount, maxAmount, range } = body;

    debug('finding maker with deviceId %s', deviceId);
    let maker = await Maker.findOne({
      deviceId,
    });

    if (!maker) {
      throw new MakerNotFoundError(
        `There is no maker with deviceId: ${deviceId}`
      );
    }

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

    maker.minAmount = minAmount;
    maker.maxAmount = maxAmount;
    maker.range = range;

    maker = await maker.saveAsync();

    debug('saved maker settings %o', maker);

    return maker;
  } catch (err) {
    debug('error while saving maker settings %o', err);
    throw err;
  }
}

async function updateLocation(body, params) {
  const { deviceId } = params;
  const { location: { lat, lng } } = body;

  let maker = await Maker.findOne({
    deviceId,
  });

  if (!maker) {
    throw new MakerNotFoundError(
      `There is no maker with deviceId: ${deviceId}`
    );
  }

  maker.location = latLngToPoint(lat, lng);

  // Object.assign({
  //   location: ,
  // });

  maker = await maker.saveAsync();

  debug('updated location of maker %s with %o', deviceId, maker.location);

  return maker;
}

module.exports = {
  register,
  saveSettings,
  updateLocation,
};
