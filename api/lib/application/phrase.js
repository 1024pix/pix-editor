import * as securityPreHandlers from './security-pre-handlers.js';
import { downloadTranslationFromPhrase, uploadTranslationToPhrase } from '../domain/usecases/index.js';
import { child } from '../infrastructure/logger.js';
import * as config from '../config.js';

const logger = child('application:phrase', { event: 'phrase' });

export async function register(server) {
  server.route([
    {
      method: 'POST',
      path: '/api/phrase/upload',
      config: {
        pre: [{ method: securityPreHandlers.checkUserHasWriteAccess }],
        handler: async function(request, h) {
          await uploadTranslationToPhrase();
          return h.response();
        },
      },
    },
    {
      method: 'POST',
      path: '/api/phrase/download',
      config: {
        pre: [{ method: securityPreHandlers.checkUserHasWriteAccess }],
        handler: async function(request, h) {
          await downloadTranslationFromPhrase();
          return h.response();
        },
      },
    },
    {
      method: 'POST',
      path: '/api/phrase/webhook',
      config: {
        auth: false,
        payload: { parse: false },
        pre: [{ method: checkPhraseappSignature }, { method: validatePhraseWebhookRequest }],
        handler: async function(request, h) {
          logger.info({ payload: request.payload }, 'Phrase webhook called');
          return h.response();
        },
        tags: [
          'api',
          'phrase',
          'webhook',
        ],
      },
    },
  ]);
}

export const name = 'phrase-api';

export async function checkPhraseappSignature(request, h) {
  const xPhraseappSignature = request.headers['x-phraseapp-signature'];
  if (!xPhraseappSignature) {
    logger.warn('Phrase webhook call missing signature');
    return h.response().code(401).takeover();
  };

  const signature = Buffer.from(xPhraseappSignature, 'base64');
  const key = await getPhraseWebhookSecretKey();

  if (!await crypto.subtle.verify('HMAC', key, signature, request.payload)) {
    logger.warn('Phrase webhook call bad signature');
    return h.response().code(400).takeover();
  }

  request.payload = JSON.parse(request.payload.toString());

  return h.response(true);
}

let phraseWebhookSecretKey;

/**
 * @returns {Promise<CryptoKey>}
 */
async function getPhraseWebhookSecretKey() {
  if (phraseWebhookSecretKey) return phraseWebhookSecretKey.promise;

  phraseWebhookSecretKey = Promise.withResolvers();

  try {
    phraseWebhookSecretKey.resolve(
      await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(config.phrase.webhookSecret),
        { name: 'HMAC', hash: { name: 'SHA-256' } },
        false,
        ['verify'],
      ),
    );
  } catch (err) {
    phraseWebhookSecretKey.reject(new Error('error while importing phrase webhook secret', { cause: err }));
  }

  return phraseWebhookSecretKey.promise;
}

const TEST_EVENT = 'test:event';
const TRANSLATIONS_EVENTS = ['translations:create', 'translations:udpate'];

function validatePhraseWebhookRequest(request, h) {
  if (request.payload.event === TEST_EVENT) {
    logger.info('received test event from phrase webhook');
    return h.response().takeover();
  }

  if (!TRANSLATIONS_EVENTS.includes(request.payload.event)) {
    logger.warn({ event: request.payload.event }, 'received unexpected event from phrase webhook');
    return h.response().code(400).takeover();
  }

  if (request.payload.branch != null) {
    logger.warn({ branch: request.payload.branch }, 'received translations event on branch');
    return h.response().code(400).takeover();
  }

  if (!config.phrase.projects.some((project) => project.projectId === request.payload.project.id)) {
    logger.warn({ project: request.payload.project }, 'received translations event on unexpected project');
    return h.response().code(400).takeover();
  }

  return h.response(true);
}
