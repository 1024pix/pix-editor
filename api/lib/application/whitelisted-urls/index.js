import * as securityPreHandlers from '../security-pre-handlers.js';
import { whitelistedUrlReadRepository } from '../../infrastructure/repositories/index.js';
import * as whitelistedUrlSerializer from '../../infrastructure/serializers/jsonapi/whitelisted-url-serializer.js';

export async function register(server) {
  server.route([
    {
      method: 'GET',
      path: '/api/whitelisted-urls',
      config: {
        pre: [{ method: securityPreHandlers.checkUserHasAdminAccess }],
        handler: async function(request, h) {
          const whitelistedUrls_read = await whitelistedUrlReadRepository.list();
          return h.response(whitelistedUrlSerializer.serialize(whitelistedUrls_read));
        },
      },
    },
  ]);
}

export const name = 'whitelisted-urls';
