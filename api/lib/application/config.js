import { configSerializer } from '../infrastructure/serializers/jsonapi/index.js';
import * as config from '../config.js';

export async function register(server) {
  server.route([
    {
      method: 'GET',
      path: '/api/config',
      config: {
        handler: function() {
          return configSerializer.serialize(config.pixEditor);
        },
      }
    },
  ]);
}

export const name = 'config-api';

