import _ from 'lodash';
import * as monitoringTools from '../monitoring-tools.js';
import * as config from '../../config.js';
import { logger } from '../logger.js';

function logObjectSerializer(obj) {
  if (config.hapi.enableRequestMonitoring) {
    const context = monitoringTools.getContext();
    return {
      ...obj,
      route: context?.request?.route?.path,
      user_id: _.get(context, 'request') ? monitoringTools.extractUserIdFromRequest(context.request) : '-',
      metrics: _.get(context, 'metrics'),
    };
  } else {
    return { ...obj };
  }
}

export { default as plugin } from 'hapi-pino';

export const options = {
  serializers: {
    req: logObjectSerializer,
  },
  instance: logger,
  logQueryParams: true,
};
