import * as securityPreHandlers from './security-pre-handlers.js';
import { getHeapSnapshot } from 'node:v8';

export function register(server) {
  server.route([
    {
      method: 'GET',
      path: '/api/heapdump',
      config: {
        pre: [{ method: securityPreHandlers.checkUserHasAdminAccess }],
        handler: async function (_, h) {
          return h
            .response(getHeapSnapshot())
            .header('Content-type', 'application/json')
            .header('Content-disposition', `attachment; filename=lcms-api-${new Date().toISOString()}.heapsnapshot`);
        },
      },
    },
  ]);
}

export const name = 'heapdump-api';
