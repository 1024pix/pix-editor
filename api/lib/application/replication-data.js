import { promiseStreamerForRepli2 } from '../infrastructure/utils/promise-streamer.js';
import { getLearningContentForReplication } from '../domain/usecases/get-learning-content-for-replication.js';

export async function register(server) {
  server.route([
    {
      method: 'GET',
      path: '/api/replication-data',
      config: {
        handler: async function(request, h) {
          return h.response(promiseStreamerForRepli2(getLearningContentForReplication()))
            .type('application/json')
            .encoding('identity');
        },
      },
    },
  ]);
}

export const name = 'databases-api';
