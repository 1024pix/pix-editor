import { promiseStreamer } from '../infrastructure/utils/promise-streamer.js';
import { getLearningContentForReplication } from '../domain/usecases/get-learning-content-for-replication.js';

export async function register(server) {
  server.route([
    {
      method: 'GET',
      path: '/api/databases/airtable',
      config: {
        handler: async function() {
          return promiseStreamer(getLearningContentForReplication());
        },
      },
    },
    {
      method: 'GET',
      path: '/api/replication-data',
      config: {
        handler: async function() {
          return promiseStreamer(getLearningContentForReplication());
        },
      },
    },
  ]);
}

export const name = 'databases-api';
