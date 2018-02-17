const debug = require('debug')('pb:server');
const mongoose = require('mongoose');
const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');
const BearerStrategy = require('passport-http-bearer').Strategy;

const config = require('./config');
const { Token } = require('./model');
const { UserNotFoundError } = require('./errors');
const makerService = require('./services/makerService');
const takerService = require('./services/takerService');
const userService = require('./services/userService');

require('./worker');

const app = express();
app.use(bodyParser.json());

mongoose.connect(config.mainMongo, err => {
  if (err) {
    debug('Error occured during connecting to instance: %o', err);
    throw err;
  }
  debug('Successfully connected to db %s', config.mainMongo);
});

passport.use(
  new BearerStrategy(async function(tokenStr, done) {
    try {
      const token = await Token.findOne({
        _id: tokenStr,
      })
        .populate('user')
        .exec();

      if (!token || !token.user) {
        throw new UserNotFoundError('There is no user that has this token');
      }

      done(null, token.user);
    } catch (err) {
      done(err);
    }
  })
);

const handle = handler => async (req, res) => {
  try {
    const response = await handler(req.body, req.params, { req, res });
    res.json({
      error: false,
      data: response,
    });
  } catch (error) {
    res.json({
      error: true,
      message: error.message,
      stack: error.stack,
      payload: error.payload || {},
    });
  }
};

const authenticate = passport.authenticate('bearer', {
  session: false,
});

app.post(
  '/maker/register/:deviceId',
  authenticate,
  handle(makerService.register)
);

app.post(
  '/maker/save-settings/:deviceId',
  authenticate,
  handle(makerService.saveSettings)
);

app.post(
  '/maker/update-location/:deviceId',
  authenticate,
  handle(makerService.updateLocation)
);

app.post(
  '/taker/register/:deviceId',
  authenticate,
  handle(takerService.register)
);

app.post(
  '/taker/create-withdrawal/:deviceId',
  authenticate,
  handle(takerService.createWithdrawal)
);

app.post('/user/register', handle(userService.register));
app.post('/user/login', handle(userService.login));

app.get('/test', (req, res) => res.json({ err: false }));

app.listen(process.env.PORT, '0.0.0.0', function() {
  debug('http server is listening on port %s', process.env.PORT);
});
