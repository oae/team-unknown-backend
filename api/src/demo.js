const debug = require('debug')('pb:demo');
const _ = require('lodash');

const { latLngToPoint } = require('./utils');
const {
  MAKER_MIN_AMOUNT,
  MAKER_MAX_AMOUNT,
  MAKER_MAX_RANGE,
  DEFAULT_LOCATION,
} = require('./constants');
const { User, Token } = require('./model');
const userService = require('./services/userService');

async function createDemoUser(name, index) {
  let user = await User.findOne({ email: `${name}-${index}@example.com` });

  if (!user) {
    user = await userService.createUser({
      email: `${name}-${index}@example.com`,
      password: '123456',
    });

    user.location = latLngToPoint(...DEFAULT_LOCATION);

    await user.save();
  }

  let token = await Token.findOne({ name: `${name}-${index}` });

  if (!token) {
    token = new Token({
      name: `${name}-${index}`,
      user: user.id,
    });

    await token.save();
  }

  return user;
}

async function createTaker(index) {
  return createDemoUser('demo-taker', index);
}

async function createMaker(index) {
  const user = await createDemoUser('demo-maker', index);
  user.maker = {
    minAmount: MAKER_MIN_AMOUNT,
    maxAmount: MAKER_MAX_AMOUNT,
    range: MAKER_MAX_RANGE,
  };
  await user.save();
  return user;
}

async function createDemoUsers(count) {
  debug('creating makers');
  await Promise.all(_.range(count).map(i => createMaker(i)));
  debug('creating takers');
  await Promise.all(_.range(count).map(i => createTaker(i)));
}

async function main() {
  try {
    createDemoUsers(10);
  } catch (err) {
    debug('error while executing demo tasks %s', err.stack);
  }
}

main();
