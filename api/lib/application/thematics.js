import Joi from 'joi';
import Boom from '@hapi/boom';
import * as Sentry from '@sentry/node';
import { logger } from '../infrastructure/logger.js';
import * as Types from './types.js';

export function register(server) {
  server.route([
    {
      method: 'GET',
      path: '/api/thematics/{thematicAirtableId}',
      config: {
        validate: {
          params: Joi.object({
            thematicAirtableId: Types.thematicId().required(),
          }),
        },
        handler: async function() {
          try {
            return null;
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

export const name = 'thematics';
