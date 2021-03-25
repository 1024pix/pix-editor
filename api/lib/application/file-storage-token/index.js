const Boom = require('@hapi/boom');

const fileStorageTokenRepository = require('../../infrastructure/repositories/file-storage-token-repository');

exports.register = async function(server) {
  server.route([
    {
      method: 'POST',
      path: '/api/file-storage-token',
      config: {
        handler: async function(request, h) {
          try {
            const token = await fileStorageTokenRepository.create();
            return h.response({ token: token.value });
          } catch (error) {
            return Boom.boomify(error, { statusCode: error.response.status });
          }
        },
      }
    },
  ]);
};

exports.name = 'file-storage-token-api';
