import axios from 'axios';
import Sentry from '@sentry/node';
import * as config from '../config.js';
import * as pixApiClient from '../infrastructure/pix-api-client.js';
import * as updatedRecordNotifier from '../infrastructure/event-notifier/updated-record-notifier.js';
import { logger } from '../infrastructure/logger.js';
import { releaseRepository } from '../infrastructure/repositories/index.js';
import * as securityPreHandlers from './security-pre-handlers.js';
import * as tablesTranslations from '../infrastructure/translations/index.js';
import * as usecases from '../domain/usecases/index.js';

const AIRTABLE_BASE_URL = 'https://api.airtable.com/v0';

export async function register(server) {
  server.route([
    {
      method: 'GET',
      path: '/api/airtable/content/{path*}',
      config: {
        handler: async function(request, h) {
          const tableName = request.params.path.split('/')[0];
          const tableTranslations = getTableTranslations(tablesTranslations, tableName);

          const response = await usecases.proxyReadRequestToAirtable(request, config.airtable.base, {
            tableTranslations,
            proxyRequestToAirtable: _proxyRequestToAirtable,
          });

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
          const tableTranslations = getTableTranslations(tablesTranslations, tableName);

          const response = await usecases.proxyWriteRequestToAirtable(request, config.airtable.base, tableName, {
            proxyRequestToAirtable: _proxyRequestToAirtable,
            tableTranslations,
            updateStagingPixApiCache: _updateStagingPixApiCache,
          });

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
          const tableName = request.params.path.split('/')[0];
          const response = await usecases.proxyDeleteRequestToAirtable(request, config.airtable.base, tableName, {
            proxyRequestToAirtable: _proxyRequestToAirtable,
          });
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
    {
      headers: { 'Authorization': `Bearer ${config.airtable.apiKey}`, 'Content-Type': 'application/json' },
      params: request.query,
      method: request.method,
      data: request.payload ? request.payload : {},
      validateStatus: () => true
    });
}

async function _updateStagingPixApiCache(type, entity, translations) {
  if (!pixApiClient.isPixApiCachePatchingEnabled()) return;

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

export function getTableTranslations(tablesTranslations, tableName) {
  const tableTranslations = tablesTranslations[tableName];

  const writeToPgEnabled = tableTranslations?.extractFromProxyObject !== undefined;

  // Lecture dans PG possible seulement si écriture dans PG activée
  const readFromPgEnabled = writeToPgEnabled && tableTranslations?.airtableObjectToProxyObject !== undefined;

  // Arrêt de l'écriture dans Airtable possible seulement si écriture et lecture dans PG activées
  const writeToAirtableDisabled = readFromPgEnabled && tableTranslations?.proxyObjectToAirtableObject !== undefined;

  return {
    ...tableTranslations,
    writeToPgEnabled,
    readFromPgEnabled,
    writeToAirtableDisabled,
  };
}
