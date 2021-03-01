const Queue = require('bull');
const config = require('../../config');
const logger = require('../logger');
const releaseRepository = require('../repositories/release-repository.js');

module.exports = {
  schedule() {
    const queue = new Queue('create-release-queue', config.scheduledJobs.redisUrl);
    queue.on('error', (err) => logger.error(err, 'Creating queue for creating release failed'));
    queue.process(createRelease);
    queue.add({}, releaseJobOptions);
  }
};

const releaseJobOptions = {
  attempts: 1,
  removeOnComplete: true,
  removeOnFail: 1,
  repeat: {
    cron: config.scheduledJobs.createReleaseTime,
    tz: 'Europe/Paris',
  },
};

async function createRelease() {
  const release = await releaseRepository.create();
  logger.debug(`Periodic release created with id ${release.id}`);
}
