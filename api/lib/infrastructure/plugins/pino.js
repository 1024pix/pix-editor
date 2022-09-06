const { get } = require('lodash');
const monitoringTools = require('../monitoring-tools');
const config = require('../../config');

function logObjectSerializer(obj) {
  if (config.hapi.enableRequestMonitoring) {
    const context = monitoringTools.getContext();
    return {
      ...obj,
      user_id: get(context, 'request') ? monitoringTools.extractUserIdFromRequest(context.request) : '-',
      metrics: get(context, 'metrics'),
    };
  } else {
    return { ...obj };
  }
}

module.exports = {
  plugin: require('hapi-pino'),
  options: {
    serializers: {
      req: logObjectSerializer,
    },
    instance: require('../logger'),
    logQueryParams: true,
  },
};
