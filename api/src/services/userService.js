const debug = require('debug')('pb:services:maker');

const bcrypt = require('bcryptjs');

const { User, Token } = require('../model');
const { UserNotFoundError, AuthenticationError } = require('../errors');
const { validateEmail, validatePassword } = require('../utils');

function generateToken(user) {
  return bcrypt.hash(`${user.id}_${new Date().getTime()}`, 10);
}

async function createToken(user) {
  debug('creating token for %s', user.email);
  const token = await generateToken(user);

  let tokenObj = new Token({
    token,
  });

  tokenObj = await tokenObj.save();

  return tokenObj;
}

async function register(body) {
  const { email, password } = body;
  validateEmail(email);
  validatePassword(password);

  const passwordHash = await bcrypt.hash(password, 10);

  let user = new User({
    email,
    password: passwordHash,
  });

  user = await user.save();

  const token = await createToken(user);

  return {
    user,
    token,
  };
}

async function login(body) {
  const { email, password } = body;
  validateEmail(email);
  validatePassword(password);

  let user = await User.findOne({
    email,
  });

  if (!user) {
    throw new UserNotFoundError(`User not found with email ${email}`);
  }

  const result = await bcrypt.compare(password, user.password);

  if (!result) {
    throw new AuthenticationError('User is not authenticated');
  }

  const token = await createToken(user);

  return {
    user,
    token,
  };
}

module.exports = {
  register,
  login,
};
