import { Webhook } from 'standardwebhooks';

import { importTranslations } from '../domain/usecases/index.js';
import { child } from '../infrastructure/logger.js';
import * as config from '../config.js';
import * as translationSerializer from '../infrastructure/serializers/weblate/translation-serializer.js';
import { translationsConfigRepository } from '../infrastructure/repositories/index.js';

const logger = child('application:weblate', { event: 'weblate' });

export async function register(server) {
  server.route([
    {
      method: 'POST',
      path: '/api/weblate/webhook',
      config: {
        auth: false,
        payload: { parse: false },
        pre: [{ method: checkWeblateAppSignature }, { method: validateWeblateWebhookRequest }],
        handler: async function(request, h) {
          const translation = translationSerializer.deserialize(request.payload);
          await importTranslations([translation]);
          return h.response();
        },
        tags: [
          'api',
          'weblate',
          'webhook',
        ],
      },
    },
  ]);
}

export const name = 'weblate-api';

export async function checkWeblateAppSignature(request, h) {
  if (!config.weblate.webhookSecret) {
    logger.warn('No secret configured for Weblate webhook');
    return h.response().code(401).takeover();
  }

  const webhook = new Webhook(config.weblate.webhookSecret);

  try {
    webhook.verify(request.payload, request.headers);
  } catch (error) {
    logger.warn({ error }, 'Weblate webhook signature verification error');
    return h.response().code(401).takeover();
  }

  request.payload = JSON.parse(request.payload.toString());

  return h.response(true);
}

const TRANSLATIONS_CHANGE_ACTION_NAMES = ['Translation changed', 'Translation added'];

async function validateWeblateWebhookRequest(request, h) {
  if (!TRANSLATIONS_CHANGE_ACTION_NAMES.includes(request.payload.action)) {
    logger.warn({ change_id: request.payload.action }, 'received unexpected change_id from Weblate webhook');
    return h.response().code(400).takeover();
  }

  if (request.payload.project !== config.weblate.project) {
    logger.warn({ project: request.payload.project }, 'received unexpected project from Weblate webhook');
    return h.response().code(400).takeover();
  }

  const translationConfig = await translationsConfigRepository.getByWeblateComponent(request.payload.component);
  if (translationConfig === undefined) {
    logger.warn({ component: request.payload.component }, 'received translations event on unexpected weblate component');
    return h.response().code(400).takeover();
  }

  if (translationConfig.uploadedLocales.includes(request.payload.translation)) {
    return h.response().code(204).takeover();
  }

  return h.response(true);
}
