const debug = require('debug')('pb:services:maker');

async function saveSettings(body, params) {
  const { deviceId } = params;
  const { online, minAmount, maxAmount, range } = body;

  const settings = {
    deviceId,
    online,
    minAmount,
    maxAmount,
    range,
  };

  debug('saving settings %o', settings);

  return settings;
}

module.exports = {
  saveSettings,
};
