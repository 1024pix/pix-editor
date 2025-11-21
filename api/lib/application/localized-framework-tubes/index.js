import * as localizedFrameworkTubesController from './localized-framework-tubes-controller.js';

export async function register(server) {
  server.route([
    {
      method: 'GET',
      path: '/api/localized-framework-tubes',
      config: { handler: localizedFrameworkTubesController.findAll },
    },
  ]);
}

export const name = 'localized-framework-tubes-api';
