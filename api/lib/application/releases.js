import Boom from '@hapi/boom';
import { releaseRepository } from '../infrastructure/repositories/index.js';
import { queue as createReleaseQueue } from '../infrastructure/scheduled-jobs/release-job.js';
import { promiseStreamer } from '../infrastructure/utils/promise-streamer.js';
import * as securityPreHandlers from './security-pre-handlers.js';

export async function register(server) {
  server.route([
    {
      method: 'GET',
      path: '/api/current-content',
      config: {
        handler: function() {
          return promiseStreamer(releaseRepository.getCurrentContent());
        },
      },
    },
    {
      method: 'POST',
      path: '/api/releases',
      config: {
        pre:[{
          method: securityPreHandlers.checkUserHasWriteAccess,
        }],
        handler: async function() {
          const job = await createReleaseQueue.add({ slackNotification: true });
          const promise = async () => {
            const releaseId = await job.finished();
            return releaseRepository.getRelease(releaseId);
          };
          return promiseStreamer(promise());
        },
      },
    },
    {
      method: 'GET',
      path: '/api/releases/latest',
      config: {
        handler: async function() {
          const release = await releaseRepository.getLatestRelease();
          return JSON.stringify(release);
        },
      },
    },
    {
      method: 'GET',
      path: '/api/releases/{id}',
      config: {
        handler: async function(request) {
          const release = await releaseRepository.getRelease(request.params.id);
          if (release) {
            return JSON.stringify(release);
          } else {
            return Boom.notFound();
          }
        },
      },
    },
  ]);
}

export const name = 'releases-api';
