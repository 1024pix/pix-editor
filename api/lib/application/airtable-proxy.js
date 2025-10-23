import axios from 'axios';
import * as config from '../config.js';
import * as securityPreHandlers from './security-pre-handlers.js';

const AIRTABLE_BASE_URL = 'https://api.airtable.com/v0';

export async function register(server) {
  server.route([
    {
      method: ['GET', 'POST', 'PATCH', 'DELETE'],
      path: '/api/airtable/changelog/{path*}',
      config: {
        pre: [
          {
            method: (request, h) => {
              if (request.method !== 'get') {
                return securityPreHandlers.checkUserHasWriteAccess(request, h);
              }
              return h.response(true);
            },
          },
        ],
        handler: async function (request, h) {
          const response = await _proxyRequestToAirtable(request, config.airtable.editorBase);
          return h.response(response.data).code(response.status);
        },
      },
    },
  ]);
}

export const name = 'airtable-proxy';

async function _proxyRequestToAirtable(request, airtableBase) {
  return axios.request(`${AIRTABLE_BASE_URL}/${airtableBase}/${request.params.path}`, {
    headers: {
      Authorization: `Bearer ${config.airtable.apiKey}`,
      'Content-Type': 'application/json',
    },
    params: request.query,
    method: request.method,
    data: request.payload ? request.payload : {},
    validateStatus: () => true,
  });
}
