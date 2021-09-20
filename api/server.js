// As early as possible in your application, require and configure dotenv.
// https://www.npmjs.com/package/dotenv#usage
require('dotenv').config();
const Hapi = require('@hapi/hapi');
const Oppsy = require('@hapi/oppsy');

const preResponseUtils = require('./lib/infrastructure/utils/pre-response-utils');

const routes = require('./lib/routes');
const plugins = require('./lib/plugins');
const config = require('./lib/config');
const security = require('./lib/infrastructure/security');
const securityPreHandlers = require('./lib/application/security-pre-handlers');
const monitoringTools = require('./lib/infrastructure/monitoring-tools');

monitoringTools.installHapiHook();

const createServer = async () => {

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

  server.ext('onPreResponse', preResponseUtils.catchDomainAndInfrastructureErrors);

  server.auth.scheme('api-token', security.scheme);
  server.auth.strategy('default', 'api-token');
  server.auth.default('default');
  await server.register(require('@hapi/basic'));
  server.auth.strategy('simple', 'basic', { validate: (request, username) => securityPreHandlers.checkUserIsAuthenticatedViaBasicAndAdmin(username) });

  const configuration = [].concat(plugins, routes);

  if (config.logging.enabled) await enableOpsMetrics(server);

  await server.register(configuration);

  return server;
};

const enableOpsMetrics = async function(server) {

  const oppsy = new Oppsy(server);

  oppsy.on('ops', (data) => {
    server.log(['ops'], data);
  });

  oppsy.start(config.logging.emitOpsEventEachSeconds * 1000);

};
module.exports = createServer;
