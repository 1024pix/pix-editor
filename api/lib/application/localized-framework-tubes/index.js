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
        handler: localizedFrameworkTubesController.create,
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
  ]);
}

export const name = 'localized-framework-tubes-api';
