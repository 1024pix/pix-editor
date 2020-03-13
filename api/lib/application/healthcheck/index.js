const healthcheckController = require('./healthcheck-controller');

exports.register = async function(server) {
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
};

exports.name = 'healthcheck-api';
