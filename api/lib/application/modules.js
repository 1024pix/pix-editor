import { moduleRepository } from '../infrastructure/repositories/index.js';
import { moduleSummarySerializer } from '../infrastructure/serializers/jsonapi/index.js';

export function register(server) {
  server.route([
    {
      method: 'GET',
      path: '/api/module-summaries',
      config: {
        handler: async () => {
          const modules = await moduleRepository.list();
          return moduleSummarySerializer.serialize(modules);
        },
      },
    },
  ]);
}

export const name = 'modules';
