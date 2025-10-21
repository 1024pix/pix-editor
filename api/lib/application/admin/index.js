import * as adminController from './admin-controller.js';
import * as securityPreHandlers from '../security-pre-handlers.js';

export async function register(server) {
  server.route([
    {
      method: 'GET',
      path: '/api/admin/schemas',
      config: {
        pre: [{ method: securityPreHandlers.checkUserHasAdminAccess }],
        handler: adminController.getSchemas,
        tags: ['api', 'admin']
      }
    },
    {
      method: 'GET',
      path: '/api/admin/entities',
      config: {
        pre: [{ method: securityPreHandlers.checkUserHasAdminAccess }],
        handler: adminController.getEntities,
        tags: ['api', 'admin']
      }
    },
  ]);
}

export const name = 'admin-api';
