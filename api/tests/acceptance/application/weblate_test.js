import { beforeEach, describe, expect, it } from 'vitest';
import { Webhook } from 'standardwebhooks';
import { databaseBuilder, knex } from '../../test-helper';
import { createServer } from '../../../server';
import * as config from '../../../lib/config.js';

describe('Acceptance | Controller | phrase-controller', () => {
  describe('POST api/weblate/webhook', () => {
    let webhook;

    beforeEach(() => {
      webhook = new Webhook(config.weblate.webhookSecret);
    });

    describe('when webhook headers are missing', () => {
      it('returns a 401 status code', async () => {
        // given
        const server = await createServer();

        // when
        const response = await server.inject({
          method: 'POST',
          url: '/api/weblate/webhook',
        });

        // then
        expect(response.statusCode).toBe(401);
      });
    });

    describe('when webhook-signature does not match payload', () => {
      it('returns a 401 status code', async () => {
        // given
        const payload = { change_id: 8910 };
        const serializedPayload = JSON.stringify(payload);

        const server = await createServer();

        // when
        const response = await server.inject({
          method: 'POST',
          url: '/api/weblate/webhook',
          payload: serializedPayload,
          headers: {
            'webhook-id': '7f1c5477f6275a69af7b83236c20cb1a',
            'webhook-timestamp': '1748505623.044281',
            'webhook-signature': 'v1,Ceo5qEr07ixe2NLpvHk3FH9bwy/WavXrAFQ/9tdO6mc=',
          },
        });

        // then
        expect(response.statusCode).toBe(401);
      });
    });

    describe('when change is none of 2 (translation_changed) or 5 (translation_added)', () => {
      it('returns a 400 status code', async () => {
        const payload = { change_id: 666 };

        const serializedPayload = JSON.stringify(payload);
        const webhookHeaders = generateWebhookHeaders(serializedPayload);

        const server = await createServer();

        // when
        const response = await server.inject({
          method: 'POST',
          url: '/api/weblate/webhook',
          payload: serializedPayload,
          headers: webhookHeaders,
        });

        // then
        expect(response.statusCode).toBe(400);
      });
    });

    describe('when project does not match config', () => {
      it('returns a 400 status code', async () => {
        const payload = {
          action: 'Translation changed',
          project: 'not-my-weblate-project',
        };

        const serializedPayload = JSON.stringify(payload);
        const webhookHeaders = generateWebhookHeaders(serializedPayload);

        const server = await createServer();

        // when
        const response = await server.inject({
          method: 'POST',
          url: '/api/weblate/webhook',
          payload: serializedPayload,
          headers: webhookHeaders,
        });

        // then
        expect(response.statusCode).toBe(400);
      });
    });

    describe('when component does not match config', () => {
      it('returns a 400 status code', async () => {
        const payload = {
          action: 'Translation changed',
          project: config.weblate.project,
          component: 'unknown-weblate-component',
        };

        const serializedPayload = JSON.stringify(payload);
        const webhookHeaders = generateWebhookHeaders(serializedPayload);

        databaseBuilder.factory.buildFramework({ id: 'fmk', name: 'Fmk' });
        databaseBuilder.factory.buildTranslationsConfig({ frameworkId: 'fmk', weblateComponent: 'weblate-component', uploadedLocales: ['fr'] });
        await databaseBuilder.commit();

        const server = await createServer();

        // when
        const response = await server.inject({
          method: 'POST',
          url: '/api/weblate/webhook',
          payload: serializedPayload,
          headers: webhookHeaders,
        });

        // then
        expect(response.statusCode).toBe(400);
      });
    });

    describe('when locale is an uploadedLocale', () => {
      it('skips event', async () => {
        const payload = {
          action: 'Translation changed',
          project: config.weblate.project,
          component: 'weblate-component',
          context: 'area.area1.title',
          translation: 'fr',
          target: 'ne doit pas être pris en compte',
        };

        const serializedPayload = JSON.stringify(payload);
        const webhookHeaders = generateWebhookHeaders(serializedPayload);

        databaseBuilder.factory.buildFramework({ id: 'fmk', name: 'Fmk' });
        databaseBuilder.factory.buildArea({ id: 'area1', code: '1', frameworkId: 'fmk' });
        databaseBuilder.factory.buildTranslation({ key: 'area.area1.title', locale: 'fr', value: 'le titre français de area1' });
        databaseBuilder.factory.buildTranslationsConfig({ weblateComponent: 'weblate-component', frameworkId: 'fmk', areaId: 'area1', uploadedLocales: ['fr'] });
        await databaseBuilder.commit();

        const server = await createServer();

        // when
        const response = await server.inject({
          method: 'POST',
          url: '/api/weblate/webhook',
          payload: serializedPayload,
          headers: webhookHeaders,
        });

        // then
        expect(response.statusCode).toBe(204);
        await expect(knex.select('key', 'locale', 'value')
          .from('translations')
          .orderBy(['key', 'locale']))
          .resolves.toStrictEqual([{ key: 'area.area1.title', locale: 'fr', value: 'le titre français de area1' }]);
      });
    });

    describe('when change action is `Translation added`', () => {
      it('saves the translation in database', async () => {
        const payload = {
          action: 'Translation added',
          project: config.weblate.project,
          component: 'weblate-component',
          context: 'area.area1.title',
          translation: 'en',
          target: 'area1’s english title',
        };

        const serializedPayload = JSON.stringify(payload);
        const webhookHeaders = generateWebhookHeaders(serializedPayload);

        databaseBuilder.factory.buildFramework({ id: 'fmk', name: 'Fmk' });
        databaseBuilder.factory.buildArea({ id: 'area1', code: '1', frameworkId: 'fmk' });
        databaseBuilder.factory.buildTranslation({ key: 'area.area1.title', locale: 'fr', value: 'le titre français de area1' });
        databaseBuilder.factory.buildTranslationsConfig({ weblateComponent: 'weblate-component', frameworkId: 'fmk', areaId: 'area1', uploadedLocales: ['fr'] });
        await databaseBuilder.commit();

        const server = await createServer();

        // when
        const response = await server.inject({
          method: 'POST',
          url: '/api/weblate/webhook',
          payload: serializedPayload,
          headers: webhookHeaders,
        });

        // then
        expect(response.statusCode).toBe(204);

        await expect(knex.select('key', 'locale', 'value').from('translations').orderBy(['key', 'locale'])).resolves.toStrictEqual([{ key: 'area.area1.title', locale: 'en', value: 'area1’s english title' }, { key: 'area.area1.title', locale: 'fr', value: 'le titre français de area1' }]);
      });
    });

    describe('when change is 2 (translation_updated)', () => {
      it('saves the translation in database', async () => {
        const payload = {
          action: 'Translation changed',
          project: config.weblate.project,
          component: 'weblate-component',
          context: 'area.area1.title',
          translation: 'en',
          target: 'area1’s english title',
        };

        const serializedPayload = JSON.stringify(payload);
        const webhookHeaders = generateWebhookHeaders(serializedPayload);

        databaseBuilder.factory.buildFramework({ id: 'fmk', name: 'Fmk' });
        databaseBuilder.factory.buildArea({ id: 'area1', code: '1', frameworkId: 'fmk' });
        databaseBuilder.factory.buildTranslation({ key: 'area.area1.title', locale: 'fr', value: 'le titre français de area1' });
        databaseBuilder.factory.buildTranslation({ key: 'area.area1.title', locale: 'en', value: 'area1’s english old title' });
        databaseBuilder.factory.buildTranslationsConfig({ weblateComponent: 'weblate-component', frameworkId: 'fmk', areaId: 'area1', uploadedLocales: ['fr'] });
        await databaseBuilder.commit();

        const server = await createServer();

        // when
        const response = await server.inject({
          method: 'POST',
          url: '/api/weblate/webhook',
          payload: serializedPayload,
          headers: webhookHeaders,
        });

        // then
        expect(response.statusCode).toBe(204);

        await expect(knex.select('key', 'locale', 'value').from('translations').orderBy(['key', 'locale'])).resolves.toStrictEqual([{ key: 'area.area1.title', locale: 'en', value: 'area1’s english title' }, { key: 'area.area1.title', locale: 'fr', value: 'le titre français de area1' }]);
      });
    });

    function generateWebhookHeaders(payload) {
      const id = crypto.randomUUID();
      const timestamp = new Date();
      const signature = webhook.sign(id, timestamp, payload);
      return {
        'webhook-id': id,
        'webhook-timestamp': Math.floor(timestamp.getTime() / 1000),
        'webhook-signature': signature,
      };
    }
  });
});
