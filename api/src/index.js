const debug = require('debug')('pb:server');
const mongoose = require('mongoose');
const express = require('express');
const bodyParser = require('body-parser');

const config = require('./config');
const makerService = require('./services/makerService');

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
      err: false,
      data: response,
    });
  } catch (err) {
    res.json({
      err: true,
      message: err.stack,
    });
  }
};

app.post('/maker/save-settings/:deviceId', handle(makerService.saveSettings));

app.listen(process.env.PORT, function() {
  debug('http server is listening on port %s', process.env.PORT);
});
