import { extractParameters } from '../../infrastructure/utils/query-params-utils.js';
import { search } from '../../domain/usecases/index.js';
import { searchSerializer } from '../../infrastructure/serializers/jsonapi/index.js';

export async function register(server) {
  server.route([
    {
      method: 'GET',
      path: '/api/search',
      config: {
        handler: async function(request) {
          const query = extractParameters(request.query);
          const results = await search(query.filter);
          return searchSerializer.serialize(results);
        },
      },
    },
  ]);
}

export const name = 'search-api';
