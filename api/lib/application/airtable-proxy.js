const axios = require('axios');
const Sentry = require('@sentry/node');
const config = require('../config');
const AIRTABLE_BASE_URL = 'https://api.airtable.com/v0';
const pixApiClient = require('../infrastructure/pix-api-client');
const updatedRecordNotifier = require('../infrastructure/event-notifier/updated-record-notifier');
const logger = require('../infrastructure/logger');
const releaseRepository = require('../infrastructure/repositories/release-repository');
const securityPreHandlers = require('./security-pre-handlers');

exports.register = async function(server) {
  server.route([
    {
      method: ['GET', 'POST', 'PATCH', 'DELETE'],
      path: '/api/airtable/content/{path*}',
      config: {
        pre: [{
          method: (request, h) => {
            if (request.method !== 'get') {
              return securityPreHandlers.checkUserHasWriteAccess(request, h);
            }
            return h.response(true);
          }
        }],
        handler: async function(request, h) {
          const response = await _proxyRequestToAirtable(request, h, config.airtable.base);
          if (
            (request.method === 'post' || request.method === 'patch')
            && response.statusCode >= 200
            && response.statusCode < 300
          ) {
            await _updateStagingPixApiCache(request, response);
          }
          return response;
        }
      },
    }, {
      method: ['GET', 'POST', 'PATCH', 'DELETE'],
      path: '/api/airtable/changelog/{path*}',
      config: {
        pre: [{
          method: (request, h) => {
            if (request.method !== 'get') {
              return securityPreHandlers.checkUserHasWriteAccess(request, h);
            }
            return h.response(true);
          }
        }],
        handler: async function(request, h) {
          return _proxyRequestToAirtable(request, h, config.airtable.editorBase);
        }
      },
    }
  ]);
};

exports.name = 'airtable-proxy';

async function _proxyRequestToAirtable(request, h, airtableBase) {
  const response = await axios.request(`${AIRTABLE_BASE_URL}/${airtableBase}/${request.params.path}`,
    { headers: { 'Authorization': `Bearer ${config.airtable.apiKey}`, 'Content-Type': 'application/json' },
      params: request.query,
      method: request.method,
      data: request.payload ? request.payload : {},
      validateStatus: () => true
    });
  return h.response(response.data).code(response.status);
}

async function _updateStagingPixApiCache(request, response) {
  try {
    const tableName = request.params.path.split('/')[0];
    const { updatedRecord, model } = await releaseRepository.serializeEntity({
      entity: response.source,
      type: tableName,
    });
    await updatedRecordNotifier.notify({ updatedRecord, model, pixApiClient });
  } catch (err) {
    logger.error(err);
    Sentry.captureException(err);
  }
}
