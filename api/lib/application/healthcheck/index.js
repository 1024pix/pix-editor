import * as healthcheckController from './healthcheck-controller.js';

export async function register(server) {
  server.route([
    {
      method: 'GET',
      path: '/api',
      config: {
        auth: false,
        handler: healthcheckController.get,
        tags: ['api']
      }
    },
  ]);
}

export const name = 'healthcheck-api';
