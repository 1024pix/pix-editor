import * as securityPreHandlers from './security-pre-handlers.js';
import * as usecases from '../domain/usecases/index.js';
import { frameworkRepository } from '../infrastructure/repositories/index.js';
import { frameworkSerializer } from '../infrastructure/serializers/jsonapi/index.js';
import Joi from 'joi';

export function register(server) {
  server.route([
    {
      method: 'GET',
      path: '/api/frameworks',
      config: {
        auth: false,
        handler: async function() {
          const frameworks = await frameworkRepository.list();
          return frameworkSerializer.serialize(frameworks);
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
          const framework = await frameworkSerializer.deserialize(request.payload);

          const createdFramework = await usecases.createFramework(framework);

          return h
            .response(frameworkSerializer.serialize(createdFramework))
            .code(201);
        },
      },
    },
  ]);
}

export const name = 'frameworks';
