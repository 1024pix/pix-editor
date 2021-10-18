const logger = require('../logger');
const Sentry = require('@sentry/node');
const Queue = require('bull');
const config = require('../../config');

const queueError = (queueName, err, ...messages) => {
  logger.error(err, queueName, ...messages);
  Sentry.captureException(err);
};
const queueMessage = (queueName, message) => {
  logger.info(queueName + ': ' + message);
};

module.exports = function createQueue(queueName) {
  const queue = new Queue(queueName, config.scheduledJobs.redisUrl);
  queue.on('error', (err, additionalError) => queueError(queueName, err, 'Queue error', additionalError));
  queue.on('failed', (job, err) => queueError(queueName, err, `Job ${job.id} failed`));
  queue.on('waiting', (jobId) => queueMessage(queueName, `A job ${jobId} has been scheduled`));
  queue.on('active', () => queueMessage(queueName, 'A job has started'));
  queue.on('stalled', () => queueMessage(queueName, 'A job has stalled'));
  queue.on('completed', () => queueMessage(queueName, 'A job has finished'));
  queue.on('paused', () => queueMessage(queueName, 'The queue has been paused'));
  queue.on('resumed', () => queueMessage(queueName, 'The queue has been resumed'));
  queue.on('cleaned', () => queueMessage(queueName, 'The queue has been cleaned'));
  queue.on('drained', () => queueMessage(queueName, 'The queue has been drained'));
  queue.on('removed', () => queueMessage(queueName, 'A job has been removed'));

  return queue;
};
