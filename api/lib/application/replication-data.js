import { promiseStreamerForRepli2 } from '../infrastructure/utils/promise-streamer.js';
import { getLearningContentForReplication } from '../domain/usecases/get-learning-content-for-replication.js';
import { logger } from '../infrastructure/logger.js';

export async function register(server) {
  server.route([
    {
      method: 'GET',
      path: '/api/replication-data',
      config: {
        handler: async function(request, h) {
          const stream = promiseStreamerForRepli2(getLearningContentForReplication());
          logger.info(
            { event: 'lcms:debug-epipe' },`${new Date().toISOString()} -- RETURNING STREAM`);
          return h.response(stream)
            .type('application/json')
            .encoding('identity');
        },
      },
    },
  ]);
}

export const name = 'databases-api';
