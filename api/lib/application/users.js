import { userSerializer } from '../infrastructure/serializers/jsonapi/index.js';

export async function register(server) {
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
}

export const name = 'users-api';

