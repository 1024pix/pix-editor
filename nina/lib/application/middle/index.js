import { getLatestReleaseFromLCMSApi } from './middle.js';

export async function register(server) {
  server.route([
    {
      method: 'GET',
      path: '/api/releases/latest',
      config: {
        auth: false,
        handler: getLatestReleaseFromLCMSApi,
        tags: ['api'],
      },
    },
    {
      method: 'POST',
      path: '/api/releases',
      config: {
        auth: false,
        handler: getLatestReleaseFromLCMSApi,
        tags: ['api']
      }
    },
    {
      method: 'GET',
      path: '/api/releases/{id}',
      config: {
        auth: false,
        handler: getLatestReleaseFromLCMSApi,
        tags: ['api']
      }
    }
  ]);
}

export const name = 'middle-api';
