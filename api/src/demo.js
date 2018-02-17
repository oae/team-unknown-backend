const debug = require('debug')('pb:demo');

const { User, Token } = require('./model');
const userService = require('./services/userService');

async function createDemoUser() {
  let demoUser = await User.findOne({ email: 'demo@example.com' });

  if (!demoUser) {
    const response = await userService.register({
      email: 'demo@example.com',
      password: '123456',
    });

    demoUser = response.user;
  }

  let token = await Token.findOne({ name: 'demo-user' });

  if (!token) {
    token = new Token({
      name: 'demo-user',
      user: demoUser.id,
    });

    await token.save();
  }
}

async function main() {
  try {
    createDemoUser();
  } catch (err) {
    debug('error while executing demo tasks %s', err.stack);
  }
}

main();
