import { describe, expect, it } from 'vitest';
import _ from 'lodash';
import { Buffer } from 'node:buffer';
import { createServer } from '../../../server';
import * as config from '../../../lib/config.js';
import { knex } from '../../test-helper.js';

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
        const serializedPayload = JSON.stringify(payload);
        const wrongSignature = Buffer.from('wrong signature').toString('base64');

        const server = await createServer();

        // when
        const response = await server.inject({
          method: 'POST',
          url: '/api/ohdear/webhook',
          payload: serializedPayload,
          headers: { 'OhDear-Signature': wrongSignature },
        });

        // then
        expect(response.statusCode).toBe(401);
      });
    });

    describe('when event is brokenLinksFoundNotification', () => {
      it('returns a 200 status code', async () => {
        // given
        const payload = {
          type: 'brokenLinksFoundNotification',
          date_time: '20191001114254',
          run: {
            id: 423155781,
            check_id: 39681,
            parameters: null,
            result: 'failed',
            result_payload: {
              broken_links: [
                {
                  crawled_url: 'https:\/\/immutable.be\/broken-links-test-page\/0\/404',
                  status_code: 404,
                  found_on_url: 'https:\/\/immutable.be\/broken-links-test-page\/',
                  link_text: 'Broken link 1',
                  type: 'link',
                  error_message: null,
                },
                {
                  crawled_url: 'https:\/\/immutable.be\/broken-links-test-page\/1\/404',
                  status_code: 404,
                  found_on_url: 'https:\/\/immutable.be\/broken-links-test-page\/',
                  link_text: 'Broken link 2',
                  type: 'image',
                  error_message: null,
                },
              ],
              crawled_urls: [
                {
                  crawled_url: 'https:\/\/immutable.be\/broken-links-test-page\/',
                  status_code: 200,
                  found_on_url: '',
                  link_text: null,
                  type: 'link',
                  error_message: null,
                },
                {
                  crawled_url: 'https:\/\/immutable.be\/broken-links-test-page\/0\/404',
                  status_code: 404,
                  found_on_url: 'https:\/\/immutable.be\/broken-links-test-page\/',
                  link_text: 'Broken link 1',
                  type: 'link',
                  error_message: null,
                },
                {
                  crawled_url: 'https:\/\/immutable.be\/broken-links-test-page\/1\/404',
                  status_code: 404,
                  found_on_url: 'https:\/\/immutable.be\/broken-links-test-page\/',
                  link_text: 'Broken link 2',
                  type: 'image',
                  error_message: null,
                },
              ],
              whitelist: [],
            },
          },
          newBrokenLinks: [
            {
              crawled_url: 'http://ohdear.app/broken-link-1',
              relative_crawled_url: '/broken-link-1',
              status_code: 404,
              found_on_url: 'http://ohdear.app/',
              relative_found_on_url: '/',
              link_text: 'Click here for broken link 1',
              internal: true,
            },
          ],
          monitor: { id: 1 },
        };
        const serializedPayload = JSON.stringify(payload);

        const signature = await generateOhDearSignature(serializedPayload);

        const server = await createServer();

        // when
        const response = await server.inject({
          method: 'POST',
          url: '/api/ohdear/webhook',
          payload: serializedPayload,
          headers: { 'OhDear-Signature': signature },
        });

        // then
        expect(response.statusCode).toBe(200);
        const brokenUrlList = await knex('broken_urls').select('*');
        expect(brokenUrlList).toHaveLength(2);
      });
    });

    describe('when event is not supported', () => {
      it('returns a 400 status code', async () => {
        const payload = { type: 'unknown' };

        const serializedPayload = JSON.stringify(payload);

        const signature = await generateOhDearSignature(serializedPayload);

        const server = await createServer();

        // when
        const response = await server.inject({
          method: 'POST',
          url: '/api/ohdear/webhook',
          payload: serializedPayload,
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
    { name: 'HMAC', hash: { name: 'SHA-256' } },
    false,
    ['sign'],
  );
  const data = encoder.encode(payload);

  return Buffer.from(await crypto.subtle.sign('HMAC', key, data)).toString('base64');
}
