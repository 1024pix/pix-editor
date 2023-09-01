import { logger } from '../logger.js';
import Sentry from '@sentry/node';
import Queue from 'bull';
import * as config from '../../config.js';

const queueError = (queueName, err, ...messages) => {
  logger.error(err, queueName, ...messages);
  Sentry.captureException(err);
};
const queueMessage = (queueName, message) => {
  logger.info(queueName + ': ' + message);
};

export function createQueue(queueName) {
  const queue = new Queue(queueName, config.scheduledJobs.redisUrl);
  queue.on('error', (err, additionalError) => queueError(queueName, err, 'Queue error', additionalError));
  queue.on('failed', (job, err) => queueError(queueName, err, `Job ${job.id} failed`));
  queue.on('waiting', (jobId) => queueMessage(queueName, `Job ${jobId} has been scheduled`));
  queue.on('active', (job) => queueMessage(queueName, `Job ${job.id} has started`));
  queue.on('stalled', (job) => queueMessage(queueName, `Job ${job.id} has stalled`));
  queue.on('completed', (job) => queueMessage(queueName, `Job ${job.id} has finished`));
  queue.on('paused', () => queueMessage(queueName, 'The queue has been paused'));
  queue.on('resumed', () => queueMessage(queueName, 'The queue has been resumed'));
  queue.on('cleaned', () => queueMessage(queueName, 'The queue has been cleaned'));
  queue.on('drained', () => queueMessage(queueName, 'The queue has been drained'));
  queue.on('removed', () => queueMessage(queueName, 'A job has been removed'));

  return queue;
}
