const debug = require('debug')('pb:server');

const express = require('express');
const app = express();

app.get('/hello', async function(req, res) {
  await new Promise(resolve => setTimeout(resolve, 1000));
  res.json({ hello: 'world' });
});

app.listen(process.env.PORT, function() {
  debug('http server is listening on port %s', process.env.PORT);
});
