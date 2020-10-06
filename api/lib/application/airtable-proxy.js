const axios = require('axios');
const config = require('../config');
const AIRTABLE_BASE_URL = 'https://api.airtable.com/v0';

exports.register = async function(server) {
  server.route([
    {
      method: 'GET',
      path: '/api/airtable/content/{path*}',
      config: {
        handler: async function(request) {
          const response = await axios.get(`${AIRTABLE_BASE_URL}/${config.airtable.base}/${request.params.path}`, { params: request.query });
          return response.data;
        }
      },
    },
  ]);
};

exports.name = 'airtable-proxy';

