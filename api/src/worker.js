const debug = require('debug')('pb:worker');

const queue = require('./queue');

const findMaker = require('./jobs/findMaker');

async function initWorkers() {
  debug('starting workers');

  queue.findMaker.process(10, findMaker);
}

async function main() {
  await initWorkers();
}

main();
