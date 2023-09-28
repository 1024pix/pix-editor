import axios from 'axios';
import Sentry from '@sentry/node';
import * as config from '../config.js';
import * as pixApiClient from '../infrastructure/pix-api-client.js';
import * as updatedRecordNotifier from '../infrastructure/event-notifier/updated-record-notifier.js';
import { logger } from '../infrastructure/logger.js';
import { releaseRepository, translationRepository } from '../infrastructure/repositories/index.js';
import * as securityPreHandlers from './security-pre-handlers.js';
import * as tablesTranslations from '../infrastructure/translations/index.js';

const AIRTABLE_BASE_URL = 'https://api.airtable.com/v0';

export async function register(server) {
  server.route([
    {
      method: 'GET',
      path: '/api/airtable/content/{path*}',
      config: {
        handler: async function(request, h) {
          const tableName = request.params.path.split('/')[0];
          const tableTranslations = tablesTranslations[tableName];

          const response = await _proxyRequestToAirtable(request, config.airtable.base);

          if (_isResponseOK(response) && tableTranslations) {
            if (response.data.records) {
              const translations = await translationRepository.listByPrefix(tableTranslations.prefix);
              response.data.records.forEach((entity) => {
                tableTranslations.hydrateToAirtableObject(entity.fields, translations) ;
              });
            } else {
              const translations = await translationRepository.listByPrefix(tableTranslations.prefixFor(response.data.fields));
              tableTranslations.hydrateToAirtableObject(response.data.fields, translations);
            }
          }

          return h.response(response.data).code(response.status);
        }
      },
    },
    {
      method: ['POST', 'PATCH'],
      path: '/api/airtable/content/{path*}',
      config: {
        pre: [{
          method: (request, h) => {
            return securityPreHandlers.checkUserHasWriteAccess(request, h);
          }
        }],
        handler: async function(request, h) {
          const tableName = request.params.path.split('/')[0];
          const tableTranslations = tablesTranslations[tableName];

          let translations;
          if (tableTranslations) {
            translations = tableTranslations.extractFromAirtableObject(request.payload.fields);
            tableTranslations.dehydrateAirtableObject(request.payload?.fields);
          }

          const response = await _proxyRequestToAirtable(request, config.airtable.base);

          if (_isResponseOK(response)) {
            if (translations) {
              if (request.method === 'patch') {
                await translationRepository.deleteByKeyPrefix(tableTranslations.prefixFor(response.data.fields));
              }

              await translationRepository.save(translations);

              tableTranslations.hydrateToAirtableObject(response.data.fields, translations);
            }

            await _updateStagingPixApiCache(tableName, response.data, translations);
          }

          return h.response(response.data).code(response.status);
        }
      },
    },
    {
      method: 'DELETE',
      path: '/api/airtable/content/{path*}',
      config: {
        pre: [{
          method: (request, h) => {
            return securityPreHandlers.checkUserHasWriteAccess(request, h);
          }
        }],
        handler: async function(request, h) {
          const response = await _proxyRequestToAirtable(request, config.airtable.base);
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
}

export const name = 'airtable-proxy';

async function _proxyRequestToAirtable(request, airtableBase) {
  return axios.request(`${AIRTABLE_BASE_URL}/${airtableBase}/${request.params.path}`,
    { headers: { 'Authorization': `Bearer ${config.airtable.apiKey}`, 'Content-Type': 'application/json' },
      params: request.query,
      method: request.method,
      data: request.payload ? request.payload : {},
      validateStatus: () => true
    });
}

async function _updateStagingPixApiCache(type, entity, translations) {
  try {
    const { updatedRecord, model } = await releaseRepository.serializeEntity({
      type,
      entity,
      translations,
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
