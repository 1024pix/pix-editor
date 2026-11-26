import Joi from 'joi';

import { draftModuleSerializer, moduleSerializer } from '../../infrastructure/serializers/jsonapi/index.js';
import { extractParameters } from '../../infrastructure/utils/query-params-utils.js';
import { duplicateModule, getModuleById, listPaginatedModules, getModuleJsonSchema } from '../../domain/usecases/index.js';
import * as Types from '../types.js';
import * as securityPreHandlers from '../security-pre-handlers.js';

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
            'filter[internalTitle]': Joi.string().empty('').allow(null).optional(),
          }),
        },
        handler: async (request) => {
          const { page, sort, filter } = extractParameters(request.query, {
            page: { size: 10, number: 1 },
            sort: [['visibility', 'desc'], ['internalTitle', 'asc']],
            filter: { internalTitle: '' },
          });
          const { modules, meta } = await listPaginatedModules({ page, sort, filter });
          return moduleSerializer.serialize(modules, {
            attributes: [
              'internalTitle',
              'details',
              'isBeta',
              'visibility',
              'url',
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
      method: 'POST',
      path: '/api/modules/{id}/duplicate',
      config: {
        pre: [{ method: securityPreHandlers.checkUserHasWriteAccess }],
        validate: { params: Joi.object({ id: Types.moduleId().required() }).required() },
        handler: async (request, h) => {
          const { id } = request.params;
          const duplicatedDraftModule = await duplicateModule({ moduleId: id });
          return h.response(draftModuleSerializer.serialize(duplicatedDraftModule, { attributes: [] })).code(201);
        },
      },
    },
    {
      method: 'GET',
      path: '/api/module-schema/module-json-schema.json',
      config: {
        auth: false,
        handler: async (_, h) => {
          const { jsonSchema, jsonSchemaChecksum } = getModuleJsonSchema();
          return h
            .response(jsonSchema)
            .type('application/json')
            .charset('UTF-8')
            .header('Cache-Control', 'public, max-age=900')
            .etag(jsonSchemaChecksum);
        },
        notes: ['- Permet de récupérer le JSON Schema de la structure des modules'],
      },
    },
  ]);
}

export const name = 'modules';
