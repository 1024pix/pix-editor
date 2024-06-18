import * as securityPreHandlers from './security-pre-handlers.js';
import { hasAuthenticatedUserAccess } from './security-utils.js';
import { getEmbedList } from '../domain/usecases/get-embed-list.js';

export async function register(server) {
  server.route([
    {
      method: 'GET',
      path: '/api/embeds',
      config: {
        pre:[{
          method: securityPreHandlers.checkUserHasWriteAccess,
        }],
        handler: async function(request) {
          if (hasAuthenticatedUserAccess(request, ['admin'])) {
            const embedList =  getEmbedList();
            return JSON.stringify(embedList);
          } else {
            // todo no access
          }
        },
      },
    },
  ]);
}

export const name = 'embed-api';
