const debug = require('debug')('pb:server');
const mongoose = require('mongoose');
const express = require('express');
const bodyParser = require('body-parser');

const config = require('./config');
const makerService = require('./services/makerService');
const takerService = require('./services/takerService');

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

app.post('/maker/register/:deviceId', handle(makerService.register));
app.post('/maker/save-settings/:deviceId', handle(makerService.saveSettings));
app.post(
  '/maker/update-location/:deviceId',
  handle(makerService.updateLocation)
);

app.post('/taker/register/:deviceId', handle(takerService.register));
app.post(
  '/taker/create-withdrawal/:deviceId',
  handle(takerService.createWithdrawal)
);

app.listen(process.env.PORT, function() {
  debug('http server is listening on port %s', process.env.PORT);
});
