const debug = require('debug')('pb:server');

const express = require('express');
const app = express();

const withdrawal = require('./withdrawal/routes');

app.use('/withdrawal', withdrawal);

app.listen(process.env.PORT, function() {
  debug('http server is listening on port %s', process.env.PORT);
});
