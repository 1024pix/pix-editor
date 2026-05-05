import Joi from 'joi';

import { moduleSummarySerializer } from '../infrastructure/serializers/jsonapi/index.js';
import { extractParameters } from '../infrastructure/utils/query-params-utils.js';
import { listPaginatedModules } from '../domain/usecases/index.js';

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
          }),
        },
        handler: async (request) => {
          const { page } = extractParameters(request.query, { page: { size: 10, number: 1 } });
          const { modules, meta } = await listPaginatedModules({ page });
          return moduleSummarySerializer.serialize(modules, meta);
        },
      },
    },
  ]);
}

export const name = 'modules';
