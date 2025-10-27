import { promiseStreamer } from '../infrastructure/utils/promise-streamer.js';
import { getLearningContentForReplication } from '../domain/usecases/get-learning-content-for-replication.js';
import { SCOPES } from '../infrastructure/logger.js';

export async function register(server) {
  server.route([
    {
      method: 'GET',
      path: '/api/replication-data',
      config: {
        handler: async function () {
          return promiseStreamer({
            promise: getLearningContentForReplication(),
            loggingScope: SCOPES.REPLICATION,
          });
        },
      },
    },
  ]);
}

export const name = 'databases-api';
