const userSerializer = require('../infrastructure/serializers/jsonapi/user-serializer');

exports.register = async function(server) {
  server.route([
    {
      method: 'GET',
      path: '/api/users/me',
      config: {
        handler: function(request, h) {
          const authenticatedUser = request.auth.credentials.user;
          return h.response(userSerializer.serialize(authenticatedUser));
        }
      },
    },
  ]);
};

exports.name = 'users-api';

