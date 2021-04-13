const Queue = require('bull');
const config = require('../../config');
const logger = require('../logger');
const releaseRepository = require('../repositories/release-repository.js');

const queue = new Queue('create-release-queue', config.scheduledJobs.redisUrl);
queue.on('error', (err) => console.log(err, 'Creating queue for creating release failed'));
queue.process(createRelease);

module.exports = {
  schedule() {
    if (!_isScheduledReleaseEnabled()) {
      logger.info('Scheduled release is not enabled - check `CREATE_RELEASE_TIME` and `REDIS_URL` variables');
      return;
    }
    queue.add({}, releaseJobOptions);
  },

  queue,

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
  return release;
}

function _isScheduledReleaseEnabled() {
  return config.scheduledJobs.createReleaseTime && config.scheduledJobs.redisUrl;
}

