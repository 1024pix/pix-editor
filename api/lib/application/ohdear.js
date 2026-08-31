import { child } from '../infrastructure/logger.js';
import * as config from '../config.js';
import * as crawledUrlSerializer from '../infrastructure/serializers/ohdear/crawled-url-serializer.js';
import { updateBrokenUrlList } from '../domain/usecases/index.js';

const logger = child('application:ohdear', { event: 'ohdear' });

export async function register(server) {
  server.route([
    {
      method: 'POST',
      path: '/api/ohdear/webhook',
      config: {
        auth: false,
        payload: { parse: false },
        pre: [
          { method: checkConfiguration },
          { method: checkOhDearSignature },
          { method: validateOhDearWebhookRequest },
        ],
        handler: async function(request, h) {
          const crawledUrlList = crawledUrlSerializer.deserialize(request.payload);
          await updateBrokenUrlList(crawledUrlList);
          return h.response().code(200);
        },
        tags: [
          'api',
          'ohdear',
          'webhook',
        ],
      },
    },
  ]);
}

export async function checkConfiguration(request, h) {
  const webhookSecret = config.urlBrokenLinksMonitor.webhookSecret;
  if (!webhookSecret) {
    logger.warn('Missing OhDear webhook secret');
    return h.response().code(400).takeover();
  }
  return h.response(true);
}

export const name = 'ohdear-api';

export async function checkOhDearSignature(request, h) {
  const ohDearSignature = request.headers['ohdear-signature'];
  if (!ohDearSignature) {
    logger.warn('OhDear webhook call missing signature');
    return h.response().code(401).takeover();
  }
  const signature = Buffer.from(ohDearSignature, 'base64');
  const key = await getOhDearWebhookSecretKey();

  const ohDearSignatureCheck = await crypto.subtle.verify({ name: 'HMAC', hash: { name: 'sha-256' } }, key, signature, request.payload);
  if (!ohDearSignatureCheck) {
    logger.warn('OhDear webhook call bad signature');
    return h.response().code(401).takeover();
  }
  request.payload = JSON.parse(request.payload.toString());

  return h.response(true);
}

let ohDearWebhookSecretKey;

/**
 * @returns {Promise<CryptoKey>}
 */
async function getOhDearWebhookSecretKey() {
  if (ohDearWebhookSecretKey) return ohDearWebhookSecretKey.promise;

  ohDearWebhookSecretKey = Promise.withResolvers();

  try {
    ohDearWebhookSecretKey.resolve(
      await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(config.urlBrokenLinksMonitor.webhookSecret),
        { name: 'HMAC', hash: { name: 'SHA-256' } },
        false,
        ['verify'],
      ),
    );
  } catch (err) {
    ohDearWebhookSecretKey.reject(new Error('error while importing ohdear webhook secret', { cause: err }));
  }

  return ohDearWebhookSecretKey.promise;
}

async function validateOhDearWebhookRequest(request, h) {
  if (request.payload.type !== 'brokenLinksFoundNotification') {
    logger.warn({ type: request.payload.type }, 'received unexpected type from ohdear webhook');
    return h.response().code(400).takeover();
  }

  return h.response(true);
}
