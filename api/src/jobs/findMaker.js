const debug = require('debug')('pb:findMaker');
// const _ = require('lodash');

const { Withdrawal, User } = require('../model');
const { MakerNotFoundError } = require('../errors');
const { MAKER_MAX_RANGE } = require('../constants');

module.exports = async job => {
  try {
    const { withdrawalId } = job.data;
    debug(
      '%d time trying to find maker for %s',
      job.options.retries,
      withdrawalId
    );

    const withdrawal = await Withdrawal.findOne({
      _id: withdrawalId,
    });

    const makers = await User.find()
      .near('location', {
        center: withdrawal.takerLocation,
        maxDistance: MAKER_MAX_RANGE,
      })
      .exec();

    // const availableMakers = _.chain(markets).map();

    debug('found markers: %o', makers);

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
