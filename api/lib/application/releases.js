const releaseRepository = require('../infrastructure/repositories/release-repository');
const { PassThrough } = require('stream');

exports.register = async function(server) {
  server.route([
    {
      method: 'GET',
      path: '/api/releases/latest',
      config: {
        auth:false,
        handler: function() {
          const writableStream = new PassThrough();
          writableStream.headers = {
            'content-type': 'application/json',
      
            // WHY: to avoid compression because when compressing, the server buffers
            // for too long causing a response timeout.
            'content-encoding': 'identity',
          };
          return releaseRepository.getLatestAsStream(writableStream);
        },
      },
    },
  ]);
};

exports.name = 'releases-api';
