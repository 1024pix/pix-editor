import { describe, expect, it } from 'vitest';
import { Buffer } from 'node:buffer';
import { createServer } from '../../../server';
import * as config from '../../../lib/config.js';

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
        const payload = { type: 'brokenLinksFoundNotification' };
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
    { name: 'HMAC', hash: { name: 'sha-256' } },
    false,
    ['sign'],
  );
  const data = encoder.encode(payload);

  return Buffer.from(await crypto.subtle.sign('HMAC', key, data)).toString('base64');
}
