import Joi from 'joi';
import Boom from '@hapi/boom';
import * as Sentry from '@sentry/node';
import * as securityPreHandlers from './security-pre-handlers.js';
import * as usecases from '../domain/usecases/index.js';
import { logger } from '../infrastructure/logger.js';
import { areaRepository } from '../infrastructure/repositories/index.js';
import { areaSerializer } from '../infrastructure/serializers/jsonapi/index.js';
import { Types } from './types.js';

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
    {
      method: 'POST',
      path: '/api/areas',
      config: {
        pre: [{ method: securityPreHandlers.checkUserHasAdminAccess }],
        validate: {
          payload: Joi.object({
            data: {
              type: Joi.string().required().equal('areas'),
              attributes: {
                'title-fr-fr': Joi.string(),
                'title-en-us': Joi.string(),
              },
              relationships: {
                framework: {
                  data: {
                    type: Joi.string().required().equal('frameworks'),
                    id: Types.frameworkId(),
                  },
                },
              },
            },
          }),
        },
        handler: async function(request, h) {
          try {
            const area = await areaSerializer.deserialize(request.payload);

            const createdArea = await usecases.createArea(area);

            return h.response(areaSerializer.serialize(createdArea)).code(201);
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
