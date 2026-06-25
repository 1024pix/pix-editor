import Joi from 'joi';
import * as securityPreHandlers from '../security-pre-handlers.js';
import { getExternalLinks } from '../../domain/usecases/index.js';
import * as externalUrlsSerializer from '../../infrastructure/serializers/html/external-urls-serializer.js';

export async function register(server) {
  server.route([
    {
      method: 'GET',
      path: '/api/external-urls',
      config: {
        auth: false,
        validate: { query: Joi.object({ pageNumber: Joi.number() }) },
        pre: [{ method: securityPreHandlers.checkUserIsUrlBrokenLinksMonitor }],
        handler: async function(request, h) {
          const externalUrls = await getExternalLinks();
          return h.response(externalUrlsSerializer.serialize(externalUrls));
        },
      },
    },
  ]);
}

export const name = 'external-urls';
