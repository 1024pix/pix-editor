const axios = require('axios');
const config = require('../config');
const AIRTABLE_BASE_URL = 'https://api.airtable.com/v0';

exports.register = async function(server) {
  server.route([
    {
      method: ['GET', 'POST', 'PATCH', 'DELETE'],
      path: '/api/airtable/content/{path*}',
      config: {
        handler: async function(request, h) {
          const response = await axios.request(`${AIRTABLE_BASE_URL}/${config.airtable.base}/${request.params.path}`,
            { headers: { 'Authorization': `Bearer ${config.airtable.apiKey}`, 'Content-Type': 'application/json' }, 
              params: request.query,
              method: request.method,
              data: request.payload,
              validateStatus: () => true
            });
          return h.response(response.data).code(response.status);
        }
      },
    },
  ]);
};

exports.name = 'airtable-proxy';

