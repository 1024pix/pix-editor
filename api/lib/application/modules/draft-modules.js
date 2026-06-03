import Joi from 'joi';

import { draftModuleSerializer } from '../../infrastructure/serializers/jsonapi/index.js';
import { createDraftModule, getDraftModuleById, listPaginatedDraftModules } from '../../domain/usecases/index.js';
import { extractParameters } from '../../infrastructure/utils/query-params-utils.js';
import * as Types from '../types.js';

export function register(server) {
  server.route([
    {
      method: 'GET',
      path: '/api/draft-modules',
      config: {
        validate: {
          query: Joi.object({
            'page[size]': Joi.number().min(1).max(100).optional(),
            'page[number]': Joi.number().min(1).optional(),
            sort: Joi.string().optional(),
          }),
        },
        handler: async (request) => {
          const { page, sort } = extractParameters(request.query, { page: { size: 10, number: 1 }, sort: [['visibility', 'desc'], ['internalTitle', 'asc']] });
          const { draftModules, meta } = await listPaginatedDraftModules({ page, sort });
          return draftModuleSerializer.serialize(draftModules, {
            attributes: [
              'internalTitle',
              'details',
              'module',
            ], meta,
          });
        },
      },
    },
    {
      method: 'GET',
      path: '/api/draft-modules/{id}',
      config: {
        validate: { params: Joi.object({ id: Types.moduleId().required() }) },
        handler: async (request) => {
          const { id } = request.params;
          const draftModule = await getDraftModuleById(id);
          return draftModuleSerializer.serialize(draftModule);
        },
      },
    },
    {
      method: 'POST',
      path: '/api/draft-modules',
      config: {
        validate: {
          payload: Joi.object({
            data: Joi.object({
              type: Joi.string().valid('draft-modules').required(),
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
          const module = await draftModuleSerializer.deserialize(request.payload);
          const savedModule = await createDraftModule(module);
          return h.response(draftModuleSerializer.serialize(savedModule)).code(201);
        },
      },
    },
  ]);
}

export const name = 'draft-modules';
