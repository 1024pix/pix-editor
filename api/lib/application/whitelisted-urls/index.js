import * as whitelistedUrlRepository from '../../infrastructure/repositories/whitelisted-url-repository.js';
import * as whitelistedUrlSerializer from '../../infrastructure/serializers/jsonapi/whitelisted-url-serializer.js';
import * as securityPreHandlers from '../security-pre-handlers.js';

export async function register(server) {
  server.route([
    {
      method: 'GET',
      path: '/api/whitelisted-urls',
      config: {
        pre: [{ method: securityPreHandlers.checkUserHasAdminAccess }],
        handler: async function(request, h) {
          const whitelistedUrls = await whitelistedUrlRepository.listRead();
          return h.response(whitelistedUrlSerializer.serialize(whitelistedUrls));
        },
      },
    },
  ]);
}

export const name = 'whitelisted-urls';
