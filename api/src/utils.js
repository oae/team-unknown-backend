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

module.exports = {
  latLngToPoint,
  validateEmail,
  validatePassword,
  validateNumber,
};
