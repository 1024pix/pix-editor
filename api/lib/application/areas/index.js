const areasController = require('./areas-controller');

exports.register = async function(server) {
  server.route([
    {
      method: 'GET',
      path: '/api/areas',
      config: {
        auth: false,
        handler: areasController.get,
      }
    },
  ]);
};

exports.name = 'areas-api';
