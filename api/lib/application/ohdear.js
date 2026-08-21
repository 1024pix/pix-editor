import { child } from '../infrastructure/logger.js';
import * as config from '../config.js';
import * as usecases from '../domain/usecases/index.js';
import * as brokenUrlSerializer from '../infrastructure/serializers/ohdear/broken-url-serializer.js';

const logger = child('application:ohdear', { event: 'ohdear' });

export async function register(server) {
  server.route([
    {
      method: 'POST',
      path: '/api/ohdear/webhook',
      config: {
        auth: false,
        payload: { parse: false },
        pre: [{ method: checkOhDearSignature }, { method: validateOhDearWebhookRequest }],
        handler: async function(request, h) {
          const brokenUrlList = await brokenUrlSerializer.deserialize(request.payload.run.result_payload.broken_links);
          await usecases.updateBrokenUrlList(brokenUrlList);
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

export const name = 'ohdear-api';

export async function checkOhDearSignature(request, h) {
  const ohDearSignature = request.headers['ohdear-signature'];
  if (!ohDearSignature) {
    logger.warn('OhDear webhook call missing signature');
    return h.response().code(401).takeover();
  };

  const signature = Buffer.from(ohDearSignature, 'base64');
  const key = await getOhDearWebhookSecretKey();

  if (!await crypto.subtle.verify('HMAC', key, signature, request.payload)) {
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
