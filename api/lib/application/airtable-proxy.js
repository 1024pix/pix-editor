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

const proxyRepositoryByAirtableTable = {
  'Referentiel': require('../infrastructure/repositories/proxy-pg/framework-proxy-repository'),
  'Domaines': require('../infrastructure/repositories/proxy-pg/area-proxy-repository'),
  'Competences': require('../infrastructure/repositories/proxy-pg/competence-proxy-repository'),
  'Thematiques': require('../infrastructure/repositories/proxy-pg/thematic-proxy-repository'),
  'Tubes': require('../infrastructure/repositories/proxy-pg/tube-proxy-repository'),
  'Acquis': require('../infrastructure/repositories/proxy-pg/skill-proxy-repository'),
  'Epreuves': require('../infrastructure/repositories/proxy-pg/challenge-proxy-repository'),
  'Tags': require('../infrastructure/repositories/proxy-pg/tag-proxy-repository'),
  'Tutoriels': require('../infrastructure/repositories/proxy-pg/tutorial-proxy-repository'),
  'Attachments': require('../infrastructure/repositories/proxy-pg/attachment-proxy-repository'),
};

async function _proxyRequestToAirtable(request, h, airtableBase) {
  const table = request.params.path.split('/')[0];
  const httpMethod = request.method.toUpperCase();
  const proxyRepository = proxyRepositoryByAirtableTable[table];
  if (!proxyRepository) logger.info(`No proxy repository found for Airtable table "${table}"`);
  if (proxyRepository && httpMethod === 'DELETE') {
    // TODO handle "about to delete"
  }
  const response = await axios.request(`${AIRTABLE_BASE_URL}/${airtableBase}/${request.params.path}`,
    { headers: { 'Authorization': `Bearer ${config.airtable.apiKey}`, 'Content-Type': 'application/json' },
      params: request.query,
      method: request.method,
      data: request.payload ? request.payload : {},
      validateStatus: () => true
    });
  try {
    if (proxyRepository) {
      if (httpMethod === 'POST') {
        await proxyRepository.createRecord(response.data);
      } else if (httpMethod === 'PATCH') {
        await proxyRepository.updateRecord(response.data);
      } else if (httpMethod === 'DELETE') {
        await proxyRepository.deleteRecord(response.data);
      }
    }
  } catch (err) {
    logger.error(err);
  }
  return h.response(response.data).code(response.status);
}
