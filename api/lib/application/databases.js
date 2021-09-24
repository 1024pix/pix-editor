const { promiseStreamer } = require('../infrastructure/utils/promise-streamer');
const usecase = require('../domain/usecases/get-airtable-content');

exports.register = async function(server) {
  server.route([
    {
      method: 'GET',
      path: '/api/databases/airtable',
      config: {
        handler: function() {
          return promiseStreamer(usecase.getAirtableContent());
        },
      },
    },
  ]);
};

exports.name = 'databases-api';
