import * as config from './lib/config.js';
import Hapi from '@hapi/hapi';
import Oppsy from 'oppsy';
import Qs from 'qs';

import { catchDomainAndInfrastructureErrors } from './lib/infrastructure/utils/pre-response-utils.js';

import { routes } from './lib/routes.js';
import { plugins } from './lib/infrastructure/plugins/index.js';
import * as security from './lib/infrastructure/security.js';
import * as monitoringTools from './lib/infrastructure/monitoring-tools.js';

monitoringTools.installHapiHook();

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
    },
    query: {
      parser: (query) => Qs.parse(query),
    },
  });

  server.ext('onPreResponse', catchDomainAndInfrastructureErrors);

  server.auth.scheme('api-token', security.scheme);
  server.auth.strategy('default', 'api-token');
  server.auth.default('default');

  const configuration = [].concat(plugins, routes);

  if (config.logging.logOpsMetrics) await enableOpsMetrics(server);

  await server.register(configuration);

  return server;
}

const enableOpsMetrics = async function(server) {

  const oppsy = new Oppsy(server);

  oppsy.on('ops', (data) => {
    server.log(['ops'], data);
  });

  oppsy.start(config.logging.emitOpsEventEachSeconds * 1000);

};
