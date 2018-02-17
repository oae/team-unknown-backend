const debug = require('debug')('pb:services:maker');
const bcrypt = require('bcryptjs');
const gravatar = require('gravatar');

const { User, Token } = require('../model');
const {
  UserNotFoundError,
  AuthenticationError,
  UserAlreadyExistsError,
} = require('../errors');
const { validateEmail, validatePassword, latLngToPoint } = require('../utils');

async function createToken(user) {
  debug('creating token for %s', user.email);

  let token = new Token({
    user: user.id,
  });

  token = await token.save();

  return token.id;
}

async function createUser(body) {
  const { email, password } = body;
  validateEmail(email);
  validatePassword(password);

  const passwordHash = await bcrypt.hash(password, 10);

  const user = new User({
    email,
    password: passwordHash,
  });

  await user.save();

  return user;
}

async function register(body) {
  try {
    const user = await createUser(body);
    const token = await createToken(user);

    return {
      user,
      token,
    };
  } catch (err) {
    debug('error while registering %s', err.stack);

    if (err.message.match(/email_1 dup key/)) {
      throw new UserAlreadyExistsError('User already exists');
    }

    throw err;
  }
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

async function updateLocation(body, req) {
  const { user } = req;
  const { location: { lat, lng } } = body;

  user.location = latLngToPoint(lat, lng);

  await user.save();

  debug('updated location of user %s with %o', user.id, user.location);

  return user;
}

async function get(body, req) {
  return {
    ...req.user.toJSON(),
    avatar: gravatar.url(req.user.email, { size: 256 }),
  };
}

module.exports = {
  createUser,
  register,
  login,
  updateLocation,
  get,
};
