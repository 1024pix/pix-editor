import * as config from '../../config.js';

export async function register(server) {
  server.route([
    {
      method: 'GET',
      path: '/{param*}',
      options: {
        auth: false,
      },
      handler: {
        directory: {
          path: `${config.hapi.publicDir}/pix-editor`,
          redirectToSlash: true
        }
      }
    }
  ]);
}

export const name = 'static-api';
