import Boom from '@hapi/boom';
import * as Sentry from '@sentry/node';
import { logger } from '../infrastructure/logger.js';
import { areaRepository } from '../infrastructure/repositories/index.js';
import { areaSerializer } from '../infrastructure/serializers/jsonapi/index.js';

export function register(server) {
  server.route([
    {
      method: 'GET',
      path: '/api/areas',
      config: {
        handler: async function() {
          try {
            const areas = await areaRepository.list();
            return areaSerializer.serialize(areas);
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

export const name = 'areas';
