import * as adminController from './admin-controller.js';

export async function register(server) {
  server.route([
    {
      method: 'GET',
      path: '/api/admin/schemas',
      config: {
        auth: false,
        handler: adminController.getSchemas,
        tags: ['api', 'admin']
      }
    },
  ]);
}

export const name = 'admin-api';
