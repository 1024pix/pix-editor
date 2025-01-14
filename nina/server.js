import * as config from './lib/config.js';
import Hapi from '@hapi/hapi';
import { routes } from './lib/routes.js';


export async function createServer() {

  const server = new Hapi.server({
    routes: {
      cors: {
        origin: ['*'],
        additionalHeaders: ['X-Requested-With']
      },
      response: {
        emptyStatusCode: 204
      }
    },
    port: config.port,
    router: {
      isCaseSensitive: false,
    }
  });

  await server.register(routes);
  return server;
}

