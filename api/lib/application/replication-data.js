const { promiseStreamer } = require('../infrastructure/utils/promise-streamer');
const usecase = require('../domain/usecases/get-learning-content-for-replication');

exports.register = async function(server) {
  server.route([
    {
      method: 'GET',
      path: '/api/databases/airtable',
      config: {
        handler: async function() {
          return promiseStreamer(usecase.getLearningContentForReplication());
        },
      },
    },
    {
      method: 'GET',
      path: '/api/replication-data',
      config: {
        handler: async function() {
          return promiseStreamer(usecase.getLearningContentForReplication());
        },
      },
    },
  ]);
};

exports.name = 'databases-api';
