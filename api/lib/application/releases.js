import Boom from '@hapi/boom';
import Joi from 'joi';
import { releaseRepository } from '../infrastructure/repositories/index.js';
import { promiseStreamer } from '../infrastructure/utils/promise-streamer.js';
import * as securityPreHandlers from './security-pre-handlers.js';
import { SCOPES } from '../infrastructure/logger.js';
import { createReleaseJobQueue } from '../infrastructure/scheduled-jobs/release-job.js';

const releaseIdType = Joi.number().greater(-2147483648).less(2147483647).required();

export async function register(server) {
  server.route([
    {
      method: 'GET',
      path: '/api/current-content',
      config: {
        handler: function() {
          return promiseStreamer({
            promise: releaseRepository.getCurrentContent(),
            loggingScope: SCOPES.RELEASE,
          });
        },
      },
    },
    {
      method: 'POST',
      path: '/api/releases',
      config: {
        pre: [{ method: securityPreHandlers.checkUserHasWriteAccess }],
        handler: async function() {
          const releaseJobQueue = createReleaseJobQueue();
          const job = await releaseJobQueue.add({ slackNotification: true });
          const promise = async () => {
            const releaseId = await job.finished();
            return releaseRepository.getRelease(releaseId);
          };
          return promiseStreamer({
            promise: promise(),
            loggingScope: SCOPES.RELEASE,
            onFinish: () => releaseJobQueue.close(),
          });
        },
      },
    },
    {
      method: 'GET',
      path: '/api/releases/latest',
      config: {
        handler: async function(request, h) {
          const ifModifiedSinceDate = request.headers?.['if-modified-since']
            ? new Date(request.headers['if-modified-since'])
            : null;
          const latestReleaseDate = await releaseRepository.getLatestReleaseDate();
          if (!ifModifiedSinceDate || latestReleaseDate.getTime() > ifModifiedSinceDate.getTime()) {
            const release = await releaseRepository.getLatestRelease();
            return JSON.stringify(release);
          }

          return h.response().header('Last-Modified', latestReleaseDate.toUTCString());
        },
      },
    },
    {
      method: 'GET',
      path: '/api/releases/{id}',
      config: {
        validate: { params: Joi.object({ id: releaseIdType }) },
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
