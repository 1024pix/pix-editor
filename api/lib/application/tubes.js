import Joi from 'joi';
import Boom from '@hapi/boom';
import * as Sentry from '@sentry/node';
import { logger } from '../infrastructure/logger.js';
import * as Types from './types.js';

export function register(server) {
  server.route([
    {
      method: 'GET',
      path: '/api/tubes/{tubeAirtableId}',
      config: {
        validate: {
          params: Joi.object({
            tubeAirtableId: Types.tubeId().required(),
          }),
        },
        handler: async function() {
          try {
            return {};
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

export const name = 'tubes';
