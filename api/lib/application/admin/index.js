import * as adminController from './admin-controller.js';
import * as securityPreHandlers from '../security-pre-handlers.js';

export async function register(server) {
  server.route([
    {
      method: 'GET',
      path: '/api/admin/schemas',
      config: {
        handler: adminController.getSchemas,
        pre: [{ method: securityPreHandlers.checkUserHasAdminAccess }],
        tags: ['api', 'admin'],
      },
    },
  ]);
}

export const name = 'admin-api';
