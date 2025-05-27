import Boom from '@hapi/boom';
import * as Sentry from '@sentry/node';
import { logger } from '../infrastructure/logger.js';
import { countryRepository } from '../infrastructure/repositories/index.js';
import { countrySerializer } from '../infrastructure/serializers/jsonapi/index.js';

export function register(server) {
  server.route([
    {
      method: 'GET',
      path: '/api/countries',
      config: {
        handler: async function() {
          try {
            const countries = await countryRepository.list();
            return countrySerializer.serialize(countries);
          } catch (err) {
            logger.error(err);
            Sentry.captureException(err);
            return Boom.internal(err);
          }
        },
      },
    }
  ]);
}

export const name = 'countries';
