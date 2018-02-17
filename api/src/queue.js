const Queue = require('bee-queue');
const config = require('./config');

const options = { redis: config.mainRedis };

const findMaker = new Queue('findMaker', {
  ...options,
  removeOnSuccess: true,
});

module.exports = {
  findMaker,
};
