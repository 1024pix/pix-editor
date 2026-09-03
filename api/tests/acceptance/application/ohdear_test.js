import { describe, expect, it } from 'vitest';
import { Buffer } from 'node:buffer';
import { createServer } from '../../../server';
import * as config from '../../../lib/config.js';
import { databaseBuilder, knex } from '../../test-helper.js';

describe('Acceptance | Controller | ohdear-controller', () => {
  describe('POST /ohdear/webhook', () => {
    describe('when OhDear-Signature header is missing', () => {
      it('returns a 401 status code', async () => {
        // given
        const server = await createServer();

        // when
        const response = await server.inject({
          method: 'POST',
          url: '/api/ohdear/webhook',
        });

        // then
        expect(response.statusCode).toBe(401);
      });
    });

    describe('when OhDear-Signature does not match payload', () => {
      it('returns a 401 status code', async () => {
        // given
        const payload = { type: 'brokenLinksFoundNotification' };
        const wrongSignature = Buffer.from('wrong signature').toString('base64');

        const server = await createServer();

        // when
        const response = await server.inject({
          method: 'POST',
          url: '/api/ohdear/webhook',
          payload,
          headers: { 'OhDear-Signature': wrongSignature },
        });

        // then
        expect(response.statusCode).toBe(401);
      });
    });

    describe('when event is brokenLinksFoundNotification', () => {
      it('returns a 200 status code', async () => {
        // given
        const _alreadyBrokenUrl = await databaseBuilder.factory.buildBrokenUrl({ statusCode: 400, url: 'https://shs.cairn.info/?lang=en' });
        const _brokenUrlFromAnotherMonitor = await databaseBuilder.factory.buildBrokenUrl({ statusCode: 503, url: 'https://example.org' });
        await databaseBuilder.commit();

        const payload = {
          type: 'brokenLinksFoundNotification',
          run: {
            result_payload: {
              crawled_urls: [
                // newly broken
                { crawled_url: 'https://cafdoc.sharepoint.com/sites/BF-P-PilotagechantiersPIX/_layouts/15/guestaccess.aspx', status_code: 403, error_message: 'Client error: `GET https://cafdoc.sharepoint.com/sites/BF-P-PilotagechantiersPIX/_layouts/15/guestaccess.aspx?` resulted in a `403 Forbidden` response' },
                { crawled_url: 'https://doi.org/10.1073/pnas.1519735112', status_code: 403, error_message: 'Client error: `GET https://doi.org/10.1073/pnas.1519735112` resulted in a `403 Forbidden` response' },
                { crawled_url: 'https://hitechglitz.com/france/cette-video-de-survol-de-mercure-montre-la-planete-avec-des-details-incroyables/', status_code: 404, error_message: 'Client error: `GET https://hitechglitz.com/france/cette-video-de-survol-de-mercure-montre-la-planete-avec-des-details-incroyables/` resulted in a `404 Not Found` response' },
                { crawled_url: 'https://openverse.org/fr/image/df5e18ed-f936-4e46-93ba-dcc4ef0d7000', status_code: 403, error_message: 'Client error: `GET https://openverse.org/fr/image/df5e18ed-f936-4e46-93ba-dcc4ef0d7000` resulted in a `403 Forbidden` response' },
                { crawled_url: 'https://pixedu.moodlecloud.com/course/view.php?id=11&lang=fr', status_code: 403, error_message: 'Client error: `GET https://pixedu.moodlecloud.com/course/view.php?id=11&lang=fr` resulted in a `403 Forbidden` response' },
                { crawled_url: 'https://qruiz.net/Q/?TQrayg', status_code: 503, error_message: 'Server error: `GET https://qruiz.net/Q/?TQrayg` resulted in a `503 Service Temporarily Unavailable` response' },
                { crawled_url: 'https://shs.cairn.info/?lang=en', status_code: 403, error_message: 'Client error: `GET https://shs.cairn.info/?lang=en` resulted in a `403 Forbidden` response' },
                { crawled_url: 'https://www.bemyeyes.com/fr/', status_code: 404, error_message: 'Client error: `GET https://www.bemyeyes.com/fr/` resulted in a `404 Not Found` response' },
                { crawled_url: 'http://www.faqs.org/faqs/', status_code: 429, error_message: 'Client error: `GET http://www.faqs.org/faqs/` resulted in a `429 Too Many Requests` response' },
                { crawled_url: 'https://www.herault-data.fr/explore/dataset/indice-de-la-qualite-de-lair-herault/table/', status_code: 404, error_message: 'Client error: `GET https://www.herault-data.fr/explore/dataset/indice-de-la-qualite-de-lair-herault/table/` resulted in a `404 Not Found` response' },
                { crawled_url: 'https://www.medias24.com/', status_code: 403, error_message: 'Client error: `GET https://www.medias24.com/` resulted in a `403 Forbidden` response' },
                // not broken
                { crawled_url: 'https://lesfondamentaux.reseau-canope.fr/video/musique/musique-creation-et-droit-dauteur/musique-creation-et-droit-dauteur/la-creation-et-le-droit-moral', status_code: 303, error_message: 'Will not follow more than 5 redirects' },
                { crawled_url: 'https://www.bsky.app/', status_code: 200, error_message: null },
              ],
            },
          },
        };

        const signature = await generateOhDearSignature(payload);

        const server = await createServer();

        // when
        const response = await server.inject({
          method: 'POST',
          url: '/api/ohdear/webhook',
          payload,
          headers: { 'OhDear-Signature': signature },
        });

        // then
        expect(response.statusCode).toBe(200);
        const brokenUrlList = await knex('broken_urls').select('*').orderBy('url');
        expect(brokenUrlList.map(({ url }) => url)).toStrictEqual([
          'http://www.faqs.org/faqs/',
          'https://cafdoc.sharepoint.com/sites/BF-P-PilotagechantiersPIX/_layouts/15/guestaccess.aspx',
          'https://doi.org/10.1073/pnas.1519735112',
          'https://example.org',
          'https://hitechglitz.com/france/cette-video-de-survol-de-mercure-montre-la-planete-avec-des-details-incroyables/',
          'https://openverse.org/fr/image/df5e18ed-f936-4e46-93ba-dcc4ef0d7000',
          'https://pixedu.moodlecloud.com/course/view.php?id=11&lang=fr',
          'https://qruiz.net/Q/?TQrayg',
          'https://shs.cairn.info/?lang=en',
          'https://www.bemyeyes.com/fr/',
          'https://www.herault-data.fr/explore/dataset/indice-de-la-qualite-de-lair-herault/table/',
          'https://www.medias24.com/',
        ]);
      });
    });

    describe('when event is brokenLinksFixedNotification', () => {
      it('returns a 200 status code', async () => {
        // given
        const _alreadyBrokenUrl = await databaseBuilder.factory.buildBrokenUrl({ statusCode: 400, url: 'https://shs.cairn.info/?lang=en' });
        const _brokenUrlFromAnotherMonitor = await databaseBuilder.factory.buildBrokenUrl({ statusCode: 503, url: 'https://example.org' });
        await databaseBuilder.commit();

        const payload = {
          type: 'brokenLinksFixedNotification',
          run: {
            result_payload: {
              crawled_urls: [
                // newly broken
                { crawled_url: 'https://cafdoc.sharepoint.com/sites/BF-P-PilotagechantiersPIX/_layouts/15/guestaccess.aspx', status_code: 403, error_message: 'Client error: `GET https://cafdoc.sharepoint.com/sites/BF-P-PilotagechantiersPIX/_layouts/15/guestaccess.aspx?` resulted in a `403 Forbidden` response' },
                { crawled_url: 'https://doi.org/10.1073/pnas.1519735112', status_code: 403, error_message: 'Client error: `GET https://doi.org/10.1073/pnas.1519735112` resulted in a `403 Forbidden` response' },
                { crawled_url: 'https://hitechglitz.com/france/cette-video-de-survol-de-mercure-montre-la-planete-avec-des-details-incroyables/', status_code: 404, error_message: 'Client error: `GET https://hitechglitz.com/france/cette-video-de-survol-de-mercure-montre-la-planete-avec-des-details-incroyables/` resulted in a `404 Not Found` response' },
                { crawled_url: 'https://openverse.org/fr/image/df5e18ed-f936-4e46-93ba-dcc4ef0d7000', status_code: 403, error_message: 'Client error: `GET https://openverse.org/fr/image/df5e18ed-f936-4e46-93ba-dcc4ef0d7000` resulted in a `403 Forbidden` response' },
                { crawled_url: 'https://pixedu.moodlecloud.com/course/view.php?id=11&lang=fr', status_code: 403, error_message: 'Client error: `GET https://pixedu.moodlecloud.com/course/view.php?id=11&lang=fr` resulted in a `403 Forbidden` response' },
                { crawled_url: 'https://qruiz.net/Q/?TQrayg', status_code: 503, error_message: 'Server error: `GET https://qruiz.net/Q/?TQrayg` resulted in a `503 Service Temporarily Unavailable` response' },
                { crawled_url: 'https://shs.cairn.info/?lang=en', status_code: 403, error_message: 'Client error: `GET https://shs.cairn.info/?lang=en` resulted in a `403 Forbidden` response' },
                { crawled_url: 'https://www.bemyeyes.com/fr/', status_code: 404, error_message: 'Client error: `GET https://www.bemyeyes.com/fr/` resulted in a `404 Not Found` response' },
                { crawled_url: 'http://www.faqs.org/faqs/', status_code: 429, error_message: 'Client error: `GET http://www.faqs.org/faqs/` resulted in a `429 Too Many Requests` response' },
                { crawled_url: 'https://www.herault-data.fr/explore/dataset/indice-de-la-qualite-de-lair-herault/table/', status_code: 404, error_message: 'Client error: `GET https://www.herault-data.fr/explore/dataset/indice-de-la-qualite-de-lair-herault/table/` resulted in a `404 Not Found` response' },
                { crawled_url: 'https://www.medias24.com/', status_code: 403, error_message: 'Client error: `GET https://www.medias24.com/` resulted in a `403 Forbidden` response' },
                // not broken
                { crawled_url: 'https://lesfondamentaux.reseau-canope.fr/video/musique/musique-creation-et-droit-dauteur/musique-creation-et-droit-dauteur/la-creation-et-le-droit-moral', status_code: 303, error_message: 'Will not follow more than 5 redirects' },
                { crawled_url: 'https://www.bsky.app/', status_code: 200, error_message: null },
              ],
            },
          },
        };

        const signature = await generateOhDearSignature(payload);

        const server = await createServer();

        // when
        const response = await server.inject({
          method: 'POST',
          url: '/api/ohdear/webhook',
          payload,
          headers: { 'OhDear-Signature': signature },
        });

        // then
        expect(response.statusCode).toBe(200);
        const brokenUrlList = await knex('broken_urls').select('*').orderBy('url');
        expect(brokenUrlList.map(({ url }) => url)).toStrictEqual([
          'http://www.faqs.org/faqs/',
          'https://cafdoc.sharepoint.com/sites/BF-P-PilotagechantiersPIX/_layouts/15/guestaccess.aspx',
          'https://doi.org/10.1073/pnas.1519735112',
          'https://example.org',
          'https://hitechglitz.com/france/cette-video-de-survol-de-mercure-montre-la-planete-avec-des-details-incroyables/',
          'https://openverse.org/fr/image/df5e18ed-f936-4e46-93ba-dcc4ef0d7000',
          'https://pixedu.moodlecloud.com/course/view.php?id=11&lang=fr',
          'https://qruiz.net/Q/?TQrayg',
          'https://shs.cairn.info/?lang=en',
          'https://www.bemyeyes.com/fr/',
          'https://www.herault-data.fr/explore/dataset/indice-de-la-qualite-de-lair-herault/table/',
          'https://www.medias24.com/',
        ]);
      });
    });

    describe('when event is not supported', () => {
      it('returns a 400 status code', async () => {
        const payload = { type: 'unknown' };

        const signature = await generateOhDearSignature(payload);

        const server = await createServer();

        // when
        const response = await server.inject({
          method: 'POST',
          url: '/api/ohdear/webhook',
          payload,
          headers: { 'OhDear-Signature': signature },
        });

        // then
        expect(response.statusCode).toBe(400);
      });
    });
  });
});

async function generateOhDearSignature(payload) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(config.urlBrokenLinksMonitor.webhookSecret),
    { name: 'HMAC', hash: { name: 'sha-256' } },
    false,
    ['sign'],
  );
  const data = encoder.encode(JSON.stringify(payload));

  return Buffer.from(await crypto.subtle.sign('HMAC', key, data)).toString('hex');
}
