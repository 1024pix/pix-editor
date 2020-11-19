const releaseRepository = require('../infrastructure/repositories/release-repository');

exports.register = async function(server) {
  server.route([
    {
      method: 'GET',
      path: '/api/releases/latest',
      config: {
        handler: function() {
          return releaseRepository.getLatest();
        },
      }
    },
  ]);
};

exports.name = 'releases-api';
