const axios = require('axios');
const Sentry = require('@sentry/node');
const config = require('../config');
const AIRTABLE_BASE_URL = 'https://api.airtable.com/v0';
const pixApiClient = require('../infrastructure/pix-api-client');
const updatedRecordNotifier = require('../infrastructure/event-notifier/updated-record-notifier');
const logger = require('../infrastructure/logger');
const releaseRepository = require('../infrastructure/repositories/release-repository');
const securityPreHandlers = require('./security-pre-handlers');
const tablesTranslations = require('../infrastructure/translations');
const translationRepository = require('../infrastructure/repositories/translation-repository');

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
          const response = await _proxyRequestToAirtable(request, config.airtable.base);

          const tableName = request.params.path.split('/')[0];
          const tableTranslations = tablesTranslations[tableName];

          if (request.method === 'get' && _isResponseOK(response) && tableTranslations) {

            if (response.data.records) {
              const translations = await translationRepository.listByPrefix(tableTranslations.prefix);
              response.data.records.forEach((entity) => {
                tableTranslations.hydrate(entity.fields, translations) ;
              });
            } else {
              const id = response.data.fields['id persistant'];
              const translations = await translationRepository.listByPrefix(`${tableTranslations.prefix}${id}.`);
              tableTranslations.hydrate(response.data.fields, translations) ;
            }
          }

          if ((request.method === 'post' || request.method === 'patch') && _isResponseOK(response)) {
            if (tableTranslations) {
              const translations = tableTranslations.extract(request.payload.fields) ?? [];
              await translationRepository.save(translations);
            }

            await _updateStagingPixApiCache(tableName, response.data);
          }

          return h.response(response.data).code(response.status);
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
          const response = await _proxyRequestToAirtable(request, config.airtable.editorBase);
          return h.response(response.data).code(response.status);
        }
      },
    }
  ]);
};

exports.name = 'airtable-proxy';

async function _proxyRequestToAirtable(request, airtableBase) {
  return axios.request(`${AIRTABLE_BASE_URL}/${airtableBase}/${request.params.path}`,
    { headers: { 'Authorization': `Bearer ${config.airtable.apiKey}`, 'Content-Type': 'application/json' },
      params: request.query,
      method: request.method,
      data: request.payload ? request.payload : {},
      validateStatus: () => true
    });
}

async function _updateStagingPixApiCache(type, entity) {
  try {
    const { updatedRecord, model } = await releaseRepository.serializeEntity({
      entity,
      type,
    });
    await updatedRecordNotifier.notify({ updatedRecord, model, pixApiClient });
  } catch (err) {
    logger.error(err);
    Sentry.captureException(err);
  }
}

function _isResponseOK(response) {
  return response.status >= 200 && response.status < 300;
}
