import { child } from '../logger.js';
import Queue from 'bull';
import * as config from '../../config.js';

export const queues = [];

export function createQueue(queueName) {
  const queue = new Queue(queueName, config.scheduledJobs.redisUrl);
  const logger = child(`job:${queueName}`, { event: queueName });
  queue.on('error', (err, additionalError) => logger.error({ err, additionalError }, 'Error in job queue'));
  queue.on('failed', (job, err) => logger.error({ jobId: job.id, err }, 'Job failed'));
  queue.on('waiting', (jobId) => logger.info({ jobId }, 'Job has been scheduled'));
  queue.on('active', (job) => logger.info({ jobId: job.id }, 'Job has started'));
  queue.on('stalled', (job) => logger.info({ jobId: job.id }, 'Job has stalled'));
  queue.on('completed', (job) => logger.info({ jobId: job.id }, 'Job has finished'));
  queue.on('paused', () => logger.info('The queue has been paused'));
  queue.on('resumed', () => logger.info('The queue has been resumed'));
  queue.on('cleaned', () => logger.info('The queue has been cleaned'));
  queue.on('drained', async function() {
    logger.info('The queue has been drained');
    await cleanQueue(queues.find((queue) => queue.name === queueName), logger);
  });
  queue.on('removed', () => logger.info('A job has been removed'));
  queues.push(queue);
  return queue;
}

async function cleanQueue(queue, logger) {
  if (!queue.childPool) {
    logger.info('No childPool to clean up');
    return;
  }

  const freeProcesses = queue.childPool?.getAllFree();
  if (!freeProcesses || freeProcesses.length === 0) {
    logger.info('No free process to clean up in childPool');
    return;
  }

  logger.info({ count: freeProcesses.length }, 'About to kill free Bull processes to free memory');
  for (const freeProcess of freeProcesses) {
    try {
      await queue.childPool.kill(freeProcess, 'SIGTERM');
    } catch (err) {
      logger.error({ err }, 'Error while killing free bull process');
    }
  }
}
