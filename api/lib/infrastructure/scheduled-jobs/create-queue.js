import { logger } from '../logger.js';
import Queue from 'bull';
import * as config from '../../config.js';

export const queues = [];

const queueError = (queueName, err, ...messages) => {
  logger.error(err, queueName, ...messages);
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
  queue.on('drained', async function () {
    queueMessage(queueName, 'The queue has been drained');
    await cleanQueue(queues.find((queue) => queue.name === queueName));
  });
  queue.on('removed', () => queueMessage(queueName, 'A job has been removed'));
  queues.push(queue);
  return queue;
}

async function cleanQueue(queue) {
  if (!queue.childPool) {
    logger.info(`No childPool to clean up for queue '${queue.name}'`);
    return;
  }

  const freeProcesses = queue.childPool?.getAllFree();
  if (!freeProcesses || freeProcesses.length === 0) {
    logger.info(`No free process to clean up in childPool for queue '${queue.name}'`);
    return;
  }

  logger.info(`About to kill ${freeProcesses.length} free Bull processes to free memory in queue '${queue.name}'...`);
  for (const freeProcess of freeProcesses) {
    try {
      await queue.childPool.kill(freeProcess, 'SIGTERM');
    } catch (error) {
      logger.error(`Error while killing free bull process in queue '${queue.name}'`, error);
    }
  }
}
