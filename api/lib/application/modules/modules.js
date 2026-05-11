import Joi from 'joi';

import { modulesDiffSerializer, moduleSerializer } from '../../infrastructure/serializers/jsonapi/index.js';
import { extractParameters } from '../../infrastructure/utils/query-params-utils.js';
import { getModuleById, getModulesDiff, listPaginatedModules } from '../../domain/usecases/index.js';
import * as Types from '../types.js';

export function register(server) {
  server.route([
    {
      method: 'GET',
      path: '/api/modules',
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
          const { modules, meta } = await listPaginatedModules({ page, sort });
          return moduleSerializer.serialize(modules, {
            attributes: [
              'internalTitle',
              'details',
              'isBeta',
              'visibility',
            ], meta,
          });
        },
      },
    },
    {
      method: 'GET',
      path: '/api/modules/{id}',
      config: {
        validate: { params: Joi.object({ id: Types.moduleId().required() }) },
        handler: async (request) => {
          const { id } = request.params;
          const module = await getModuleById(id);
          return moduleSerializer.serialize(module);
        },
      },
    },
    {
      method: 'GET',
      path: '/api/modules-diff',
      config: {
        auth: false,
        handler: async (request, h) => {
          const { oldId, newId } = request.query;
          const modulesDiff = await getModulesDiff({ oldId, newId });
          return h
            .response(modulesDiffSerializer.serialize(modulesDiff))
            .code(200)
            .header('Content-type', 'text/plain');
        },
      },
    },
  ]);
}

export const name = 'modules';
