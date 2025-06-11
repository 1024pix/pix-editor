import Joi from 'joi';
import * as securityPreHandlers from './security-pre-handlers.js';
import * as usecases from '../domain/usecases/index.js';
import { areaRepository } from '../infrastructure/repositories/index.js';
import { areaSerializer } from '../infrastructure/serializers/jsonapi/index.js';
import * as Types from './types.js';

export function register(server) {
  server.route([
    {
      method: 'GET',
      path: '/api/areas',
      config: {
        handler: async function() {
          const areas = await areaRepository.list();
          return areaSerializer.serialize(areas);
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
          const area = await areaSerializer.deserialize(request.payload);

          const createdArea = await usecases.createArea(area);

          return h.response(areaSerializer.serialize(createdArea)).code(201);
        },
      },
    },
  ]);
}

export const name = 'areas';
