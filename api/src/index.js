const debug = require('debug')('pb:server');
const mongoose = require('mongoose');

const express = require('express');
const app = express();

const config = require('./config');
const withdrawal = require('./withdrawal/routes');

mongoose.connect(config.mainMongo, err => {
  if (err) {
    debug('Error occured during connecting to instance: %o', err);
    throw err;
  }
  debug('Successfully connected to db %s', config.mainMongo);
});

app.use('/withdrawal', withdrawal);

app.listen(process.env.PORT, function() {
  debug('http server is listening on port %s', process.env.PORT);
});
