import * as securityPreHandlers from '../security-pre-handlers.js';
import { urlRepository } from '../../infrastructure/repositories/index.js';
import * as externalUrlsSerializer from '../../infrastructure/serializers/html/external-urls-serializer.js';

export async function register(server) {
  server.route([
    {
      method: 'GET',
      path: '/api/external-urls',
      config: {
        auth: false,
        pre: [{ method: securityPreHandlers.checkUserIsUrlBrokenLinksMonitor }],
        handler: async function(request, h) {
          const externalUrls = await urlRepository.get();
          return h.response(externalUrlsSerializer.serialize(externalUrls));
        },
      },
    },
  ]);
}

export const name = 'external-urls';
