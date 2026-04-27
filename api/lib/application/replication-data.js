import { PassThrough, Writable } from 'node:stream';

import { iterableToStream, stringifyMultiJsonStream } from 'json-stream-es';

import { streamLearningContentForReplication } from '../domain/usecases/index.js';
import { logger, SCOPES } from '../infrastructure/logger.js';

export async function register(server) {
  server.route([
    {
      method: 'GET',
      path: '/api/replication-stream',
      config: {
        auth: false,
        handler: function(request, h) {
          const stream = new PassThrough({ highWaterMark: 2 ** 10 });
          const controller = new AbortController();
          iterableToStream(streamLearningContentForReplication(controller.signal))
            .pipeThrough(stringifyMultiJsonStream())
            .pipeThrough(new TextEncoderStream())
            .pipeTo(Writable.toWeb(stream))
            .catch((err) => {
              logger.error({ event: SCOPES.REPLICATION, err }, 'error while streaming replication');
              controller.abort();
            });
          return h.response(stream);
        },
      },
    },
  ]);
}

export const name = 'databases-api';
