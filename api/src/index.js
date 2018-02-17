const debug = require('debug')('pb:server');
const mongoose = require('mongoose');
const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');
const BearerStrategy = require('passport-http-bearer').Strategy;
const morgan = require('morgan');

const config = require('./config');
const { Token } = require('./model');
const { UserNotFoundError } = require('./errors');
const makerService = require('./services/makerService');
const takerService = require('./services/takerService');
const userService = require('./services/userService');

require('./demo');
require('./worker');

const app = express();
app.use(bodyParser.json());
app.use(morgan('tiny'));

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
      let token;
      if (tokenStr.match(/demo/)) {
        token = await Token.findOne({
          name: tokenStr,
        })
          .populate('user')
          .exec();
      } else {
        token = await Token.findOne({
          _id: tokenStr,
        })
          .populate('user')
          .exec();
      }

      if (!token || !token.user) {
        throw new UserNotFoundError('There is no user that has this token');
      }

      done(null, token.user);
    } catch (err) {
      done(null, false, { message: 'Incorrect token' });
    }
  })
);

const handle = handler => async (req, res) => {
  try {
    const response = await handler(req.body, req, res);
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

app.get('/test', (req, res) => res.json({ err: false }));

app.post('/user/register', handle(userService.register));
app.post('/user/login', handle(userService.login));
app.post(
  '/user/update-location',
  authenticate,
  handle(userService.updateLocation)
);

app.post(
  '/maker/toggle-online',
  authenticate,
  handle(makerService.toggleOnline)
);

app.post(
  '/maker/save-settings',
  authenticate,
  handle(makerService.saveSettings)
);

app.post(
  '/taker/create-withdrawal',
  authenticate,
  handle(takerService.createWithdrawal)
);

app.listen(process.env.PORT, '0.0.0.0', function() {
  debug('http server is listening on port %s', process.env.PORT);
});
