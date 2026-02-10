import { PassThrough } from 'node:stream';

import * as securityPreHandlers from './security-pre-handlers.js';
import { getEmbedList } from '../domain/usecases/get-embed-list.js';
import { installEmbed } from '../domain/usecases/install-embed.js';
import { embedSerializer } from '../infrastructure/serializers/jsonapi/index.js';

export async function register(server) {
  server.route([
    {
      method: 'GET',
      path: '/api/embeds.csv',
      config: {
        pre: [{ method: securityPreHandlers.checkUserHasAdminAccess }],
        handler: async function(request, h) {
          const stream = new PassThrough();
          await getEmbedList(stream);
          return h.response(stream).header('Content-type', 'text/csv');
        },
      },
    },
    {
      method: 'POST',
      path: '/api/embeds',
      config: {
        pre: [{ method: securityPreHandlers.checkUserHasAdminAccess }],
        handler: async (request, h) => {
          const embed = await embedSerializer.deserialize(request.payload);
          const createdEmbed = await installEmbed(embed);
          return h.response(embedSerializer.serialize(createdEmbed)).created();
        },
      },
    },
  ]);
}

export const name = 'embed-api';
