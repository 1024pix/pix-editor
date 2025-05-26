import Joi from 'joi';
import Boom from '@hapi/boom';
import * as Sentry from '@sentry/node';
import { logger } from '../infrastructure/logger.js';
import * as Types from './types.js';
import { thematicRepository } from '../infrastructure/repositories/index.js';
import { thematicSerializer } from '../infrastructure/serializers/jsonapi/index.js';

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
        handler: async function(request) {
          try {
            const thematic = await thematicRepository.getByAirtableId(request.params.thematicAirtableId);
            if (!thematic) return Boom.notFound('unknown thematic id');
            return thematicSerializer.serialize(thematic);
          } catch (err) {
            logger.error(err);
            Sentry.captureException(err);
            return Boom.internal(err);
          }
        },
      },
    },
    {
      method: 'GET',
      path: '/api/thematics',
      config: {
        handler: async function() {
          try {
            const thematics = await thematicRepository.list();
            return thematicSerializer.serialize(thematics);
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
