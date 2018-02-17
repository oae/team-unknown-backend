const debug = require('debug')('pb:findMaker');
// const _ = require('lodash');

const { Withdrawal, User } = require('../model');
const { MakerNotFoundError } = require('../errors');
const { DISTANCE_MULTIPLIER } = require('../constants');

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

    const makers = await User.aggregate([
      {
        $geoNear: {
          near: withdrawal.takerLocation,
          distanceField: 'distance',
          distanceMultiplier: DISTANCE_MULTIPLIER,
          spherical: false,
          uniqueDocs: true,
        },
      },
      {
        $addFields: {
          delta: { $subtract: ['$maker.range', '$distance'] },
        },
      },
      {
        $match: {
          'maker.online': true,
          'maker.minAmount': { $lte: withdrawal.amount },
          'maker.maxAmount': { $gte: withdrawal.amount },
          delta: { $gte: 0 },
        },
      },
      { $sort: { delta: 1 } },
    ]);

    if (makers.length < 1) {
      throw new MakerNotFoundError(
        'We could not find a maker that can suit this withdrawal'
      );
    }

    debug(
      'Found %d matching makers for withdrawal: %s',
      makers.length,
      withdrawalId
    );

    return makers[0];
  } catch (err) {
    debug('error while finding maker %s', err.stack);
    throw err;
  }
};
