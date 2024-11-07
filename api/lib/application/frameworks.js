import Boom from '@hapi/boom';
import * as Sentry from '@sentry/node';
import { logger } from '../infrastructure/logger.js';
import { frameworkRepository } from '../infrastructure/repositories/index.js';
import { frameworkSerializer } from '../infrastructure/serializers/jsonapi/index.js';

export function register(server) {
  server.route([
    {
      method: 'GET',
      path: '/api/frameworks',
      config: {
        handler: async function() {
          try {
            const frameworks = await frameworkRepository.list();
            return frameworkSerializer.serialize(frameworks);
          } catch (err) {
            logger.error(err);
            Sentry.captureException(err);
            return Boom.internal(err);
          }
        },
      },
    },
  ]);
}

export const name = 'frameworks';
