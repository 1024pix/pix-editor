import Boom from '@hapi/boom';
import * as Sentry from '@sentry/node';
import * as securityPreHandlers from './security-pre-handlers.js';
import { usecases as injectedUsecases } from '../domain/usecases/propal/index.js';
import { logger } from '../infrastructure/logger.js';
import { frameworkRepository } from '../infrastructure/repositories/index.js';
import { frameworkSerializer } from '../infrastructure/serializers/jsonapi/index.js';
import Joi from 'joi';

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
    {
      method: 'POST',
      path: '/api/frameworks',
      config: {
        pre: [{ method: securityPreHandlers.checkUserHasAdminAccess }],
        validate: {
          payload: Joi.object({
            data: {
              type: Joi.string().equal('frameworks'),
              attributes: {
                name: Joi.string().required(),
              },
            },
          }),
        },
        handler: async function(request, h) {
          try {
            const framework = await frameworkSerializer.deserialize(request.payload);

            const createdFramework = await injectedUsecases.createFramework({ framework });

            return h
              .response(frameworkSerializer.serialize(createdFramework))
              .code(201);
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
