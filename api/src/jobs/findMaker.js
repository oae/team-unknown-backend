const debug = require('debug')('pb:findMaker');
const { MakerNotFoundError } = require('../errors');

module.exports = async job => {
  try {
    const { withdrawalId } = job.data;
    debug(
      '%d time trying to find maker for %s',
      job.options.retries,
      withdrawalId
    );
    const random = Math.random();
    if (random >= 0.5) {
      throw new MakerNotFoundError(
        'We could not find a maker that can suit this withdrawal'
      );
    }

    debug('successfully found a maker for %s', withdrawalId);
    return random;
  } catch (err) {
    debug('error while finding maker %s', err.stack);
    throw err;
  }
};
