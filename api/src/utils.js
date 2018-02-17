const _ = require('lodash');

const { ValidationError } = require('./errors');

function latLngToPoint(lat, lng) {
  return {
    type: 'Point',
    coordinates: [lng, lat],
  };
}

function validateNumber({ number, min, max, fieldName }) {
  try {
    if (!_.isFinite(number)) {
      throw `must be a number`;
    }

    if (number < min) {
      throw `cannot be less than ${min}`;
    }

    if (number > max) {
      throw `cannot be more than ${max}`;
    }
  } catch (errMessage) {
    const error = new ValidationError(`${fieldName} ${errMessage}`);
    error.payload = { fieldName };
    throw error;
  }
}

module.exports = {
  latLngToPoint,
  validateNumber,
};
