const releasesController = require('./releases-controller');

exports.register = async function(server) {
  server.route([
    {
      method: 'POST',
      path: '/api/releases',
      config: {
        auth: false,
        handler: releasesController.post,
      }
    },
  ]);
};

exports.name = 'releases-api';
