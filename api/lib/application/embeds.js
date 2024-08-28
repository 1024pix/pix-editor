import * as securityPreHandlers from './security-pre-handlers.js';
import { getEmbedList } from '../domain/usecases/get-embed-list.js';
import { PassThrough } from 'node:stream';

export async function register(server) {
  server.route([
    {
      method: 'GET',
      path: '/api/embeds.csv',
      config: {
        pre:[{
          method: securityPreHandlers.checkUserHasAdminAccess,
        }],
        handler: async function(request, h) {
          const stream = new PassThrough();
          await getEmbedList(stream);
          return h.response(stream).header('Content-type', 'text/csv');
        },
      },
    },
  ]);
}

export const name = 'embed-api';
