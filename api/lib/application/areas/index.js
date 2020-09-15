const areasController = require('./areas-controller');

exports.register = async function(server) {
  server.route([
    {
      method: 'GET',
      path: '/api/areas',
      config: {
        handler: areasController.get,
      }
    },
  ]);
};

exports.name = 'areas-api';
