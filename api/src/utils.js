const _ = require('lodash');

const { ValidationError } = require('./errors');

function latLngToPoint(lat, lng) {
  return [lng, lat];
}

const RE_EMAIL = /[^\\.\\s@:][^\\s@:]*(?!\\.)@[^\\.\\s@]+(?:\\.[^\\.\\s@]+)*/;

function validateEmail(email) {
  if (!_.isString(email) || _.isEmpty(email)) {
    const err = new ValidationError('Email must be present');
    err.fieldName = 'email';
    throw err;
  }

  if (!RE_EMAIL.test(email)) {
    const err = new ValidationError('You need to provide a valid email');
    err.fieldName = 'email';
    throw err;
  }
}

function validatePassword(password) {
  if (!_.isString(password) || _.isEmpty(password)) {
    const err = new ValidationError('Password must be present');
    err.fieldName = 'password';
    throw err;
  }

  if (password.length < 6) {
    const err = new ValidationError('Password must be at least 6 character');
    err.fieldName = 'password';
    throw err;
  }
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

function measure(lat1, lon1, lat2, lon2) {
  // generally used geo measurement function
  var R = 6378.137; // Radius of earth in KM
  var dLat = lat2 * Math.PI / 180 - lat1 * Math.PI / 180;
  var dLon = lon2 * Math.PI / 180 - lon1 * Math.PI / 180;
  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) *
      Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c;
  return d * 1000; // meters
}

function findAvailableMakers(makers, takerLocation) {
  return _.chain(makers)
    .map(user => {
      const distance = measure(
        user.location[1],
        user.location[0],
        takerLocation[1],
        user.location[0]
      );
      return { user, distance };
    })
    .filter(item => item.distance <= item.user.maker.maxDistance)
    .sortBy(item => -item.distance)
    .value();
}

module.exports = {
  latLngToPoint,
  validateEmail,
  validatePassword,
  validateNumber,
  measure,
  findAvailableMakers,
};
