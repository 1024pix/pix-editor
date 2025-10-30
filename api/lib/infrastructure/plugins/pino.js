import { stdSerializers } from 'pino';

import * as monitoringTools from '../monitoring-tools.js';
import * as config from '../../config.js';
import { logger as loggerPino } from '../logger.js';

const serializersSym = Symbol.for('pino.serializers');

function requestSerializer(req) {
  const enhancedReq = {
    ...req,
    version: config.version,
  };

  if (!config.hapi.enableRequestMonitoring) return enhancedReq;

  const context = monitoringTools.getContext();

  return {
    ...enhancedReq,
    user_id: monitoringTools.extractUserIdFromRequest(context.request),
    metrics: context?.metrics,
    route: context?.request?.route?.path,
  };
}

const plugin = {
  name: 'hapi-pino',
  register: async function (server, options) {
    const serializers = {
      req: stdSerializers.wrapRequestSerializer(requestSerializer),
      res: stdSerializers.wrapResponseSerializer(stdSerializers.res),
    };
    const logger = options.instance;
    logger[serializersSym] = Object.assign({}, serializers, logger[serializersSym]);

    server.ext('onPostStart', async function () {
      logger.info(server.info, 'server started');
    });

    server.ext('onPostStop', async function () {
      logger.info(server.info, 'server stopped');
    });

    server.events.on('log', function (event) {
      logger.info({ tags: event.tags, data: event.data });
    });

    server.events.on('request', function (request, event) {
      if (event.channel !== 'error') {
        return;
      }
      if (event.error) {
        logger.error(
          {
            tags: event.tags,
            err: event.error,
          },
          'request error',
        );
      }
    });

    server.events.on('response', (request) => {
      const info = request.info;

      logger.info(
        {
          queryParams: request.query,
          req: request,
          res: request.raw.res,
          responseTime: (info.completed !== undefined ? info.completed : info.responded) - info.received,
        },
        'request completed',
      );
    });
  },
};

const options = {
  instance: loggerPino,
};

export { options, plugin };
