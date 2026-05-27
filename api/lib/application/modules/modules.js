import Joi from 'joi';

import { moduleSerializer } from '../../infrastructure/serializers/jsonapi/index.js';
import { extractParameters } from '../../infrastructure/utils/query-params-utils.js';
import { listPaginatedModules } from '../../domain/usecases/index.js';

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
  ]);
}

export const name = 'modules';
