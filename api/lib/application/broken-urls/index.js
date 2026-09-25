import * as securityPreHandlers from '../security-pre-handlers.js';
import * as brokenUrlSerializer from '../../infrastructure/serializers/jsonapi/broken-url-serializer.js';
import { brokenUrlRepository, whitelistedUrlRepository } from '../../infrastructure/repositories/index.js';

export async function register(server) {
  server.route([
    {
      method: 'GET',
      path: '/api/broken-urls',
      config: {
        pre: [{ method: securityPreHandlers.checkUserHasWriteAccess }],
        handler: async function(request, h) {
          const brokenUrlList = await brokenUrlRepository.list();
          const whitelistedUrls = await whitelistedUrlRepository.listActive();

          const isUrlWhitelisted = (url) => whitelistedUrls.some((whitelistedUrl) => whitelistedUrl.matches(url));
          const filteredBrokenUrls = brokenUrlList.filter((brokenUrl) => !isUrlWhitelisted(brokenUrl.url));

          return h.response(brokenUrlSerializer.serialize(filteredBrokenUrls));
        },
      },
    },
  ]);
}

export const name = 'broken-urls';
