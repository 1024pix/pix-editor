import * as localizedFrameworkTubesController from './localized-framework-tubes-controller.js';
import * as securityPreHandlers from '../security-pre-handlers.js';
import Joi from 'joi';

export async function register(server) {
  server.route([
    {
      method: 'GET',
      path: '/api/localized-framework-tubes',
      config: { handler: localizedFrameworkTubesController.filter },
    },
    {
      method: 'POST',
      path: '/api/localized-framework-tubes',
      config: {
        pre: [{ method: securityPreHandlers.checkUserHasWriteAccess }],
        handler: localizedFrameworkTubesController.upsert,
        validate: {
          payload: Joi.object({
            data: {
              type: 'localized-framework-tubes',
              attributes: {
                'tube-id': Joi.string().required(),
                'max-level': Joi.number().required(),
                locale: Joi.string().required(),
              },
            },
          }),
        },
      },
    },
    {
      method: 'PATCH',
      path: '/api/localized-framework-tubes/{id}',
      config: {
        pre: [{ method: securityPreHandlers.checkUserHasWriteAccess }],
        handler: localizedFrameworkTubesController.upsert,
        validate: {
          params: Joi.object({ id: Joi.string().required() }),
          payload: Joi.object({
            data: {
              id: Joi.number().required(),
              type: 'localized-framework-tubes',
              attributes: {
                'tube-id': Joi.string().required(),
                'max-level': Joi.number().required(),
                locale: Joi.string().required(),
              },
            },
          }),
        },
      },
    },
    {
      method: 'DELETE',
      path: '/api/localized-framework-tubes/{id}',
      config: { handler: localizedFrameworkTubesController.remove },
    },
  ]);
}

export const name = 'localized-framework-tubes-api';
