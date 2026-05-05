import Joi from 'joi';

import { moduleRepository } from '../infrastructure/repositories/index.js';
import { moduleSummarySerializer } from '../infrastructure/serializers/jsonapi/index.js';
import { extractParameters } from '../infrastructure/utils/query-params-utils.js';

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
          const modules = await moduleRepository.list({ page });
          return moduleSummarySerializer.serialize(modules);
        },
      },
    },
  ]);
}

export const name = 'modules';
