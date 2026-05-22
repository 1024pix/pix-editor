import Joi from 'joi';

import { moduleSerializer, moduleSummarySerializer } from '../infrastructure/serializers/jsonapi/index.js';
import { extractParameters } from '../infrastructure/utils/query-params-utils.js';
import { createModule, listPaginatedModules } from '../domain/usecases/index.js';

export function register(server) {
  server.route([
    {
      method: 'GET',
      path: '/api/module-summaries',
      config: {
        validate: {
          query: Joi.object({
            'page[size]': Joi.number().min(1).max(100).optional(),
            'page[number]': Joi.number().min(1).optional(),
            sort: Joi.string().optional(),
          }),
        },
        handler: async (request) => {
          const { page, sort } = extractParameters(request.query, { page: { size: 10, number: 1 }, sort: [['visibility', 'desc'], ['title', 'asc']] });
          const { modules, meta } = await listPaginatedModules({ page, sort });
          return moduleSummarySerializer.serialize(modules, meta);
        },
      },
    },
    {
      method: 'POST',
      path: '/api/modules',
      config: {
        validate: {
          payload: Joi.object({
            data: Joi.object({
              type: Joi.string().valid('modules').required(),
              attributes: Joi.object({
                'internal-title': Joi.string().required(),
                title: Joi.string().required(),
                'is-beta': Joi.boolean().required(),
                slug: Joi.string().required(),
                visibility: Joi.string().required(),
                details: Joi.object().required(),
                sections: Joi.array().required(),
                glossary: Joi.array().required(),
              }).required(),
            }).required(),
          }).required(),
        },
        handler: async (request, h) => {
          const module = await moduleSerializer.deserialize(request.payload);
          const savedModule = await createModule(module);
          return h.response(moduleSerializer.serialize(savedModule)).code(201);
        },
      },
    },
  ]);
}

export const name = 'modules';
