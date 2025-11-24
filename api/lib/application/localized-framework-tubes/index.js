import * as localizedFrameworkTubesController from './localized-framework-tubes-controller.js';
import Joi from 'joi';

export async function register(server) {
  server.route([
    {
      method: 'GET',
      path: '/api/localized-framework-tubes',
      config: { handler: localizedFrameworkTubesController.findAll },
    },
    {
      method: 'POST',
      path: '/api/localized-framework-tubes',
      config: {
        handler: localizedFrameworkTubesController.upsert,
        validate: {
          payload: Joi.object({
            data: {
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
      method: 'PUT',
      path: '/api/localized-framework-tubes/{id}',
      config: {
        handler: localizedFrameworkTubesController.upsert,
        validate: {
          params: Joi.object({ id: Joi.string().required() }),
          payload: Joi.object({
            data: {
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
