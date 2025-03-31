import { beforeEach, describe, expect, it } from 'vitest';
import nock from 'nock';
import { databaseBuilder, generateAuthorizationHeader } from '../../../test-helper.js';
import { createServer } from '../../../../server.js';

describe('Acceptance | Controller | airtable-proxy-controller', () => {

  describe('POST /api/airtable/content/{Table}', () => {

    describe('error cases', () => {

      it('should return airtable error status code', async () => {
        // Given
        const user = await createAdminUser();
        nock('https://api.airtable.com')
          .post('/v0/airtableBaseValue/Tutoriels', { param: 'value' })
          .matchHeader('authorization', 'Bearer airtableApiKeyValue')
          .matchHeader('content-type', 'application/json')
          .reply(401, 'Unauthorized');
        const server = await createServer();

        // When
        const response = await server.inject({
          method: 'POST',
          url: '/api/airtable/content/Tutoriels',
          headers: generateAuthorizationHeader(user),
          payload: { param: 'value' }
        });

        // Then
        expect(response.statusCode).to.equal(401);
        expect(response.result).to.equal('Unauthorized');
      });

      it('should forbid POST request with readonly access', async () => {
        // Given
        const user = await createReadonlyUser();
        const server = await createServer();

        // When
        const response = await server.inject({
          method: 'POST',
          url: '/api/airtable/content/Tutoriels',
          headers: generateAuthorizationHeader(user),
          payload: { param: 'value' }
        });

        // Then
        expect(response.statusCode).to.equal(403);
      });
    });
  });

  describe('when Table is unknown or should not use proxy', () => {
    const oldOrUnknownTables = ['Missions', 'Referentiel', 'Domaine', 'Acquis'];

    let headers, server;

    beforeEach(async () => {
      headers = generateAuthorizationHeader(await createAdminUser());
      server = await createServer();
    });

    oldOrUnknownTables.forEach((Table) => {
      describe(`GET /api/airtable/content/${Table}`, () => {
        it('should return status code 404', async () => {
          // Given
          const method = 'GET';
          const url = `/api/airtable/content/${Table}`;

          // Then
          const response = await server.inject({ method, url, headers });

          // Then
          expect(response.statusCode).to.equal(404);
        });
      });

      describe(`GET /api/airtable/content/${Table}/rec1234abcd`, () => {
        it('should return status code 404', async () => {
          // Given
          const method = 'GET';
          const url = `/api/airtable/content/${Table}/rec1234abcd`;

          // Then
          const response = await server.inject({ method, url, headers });

          // Then
          expect(response.statusCode).to.equal(404);
        });
      });

      describe(`POST /api/airtable/content/${Table}`, () => {
        it('should return status code 404', async () => {
          // Given
          const method = 'POST';
          const url = `/api/airtable/content/${Table}`;

          // Then
          const response = await server.inject({
            method,
            url,
            headers ,
            payload: { param: 'value' }
          });

          // Then
          expect(response.statusCode).to.equal(404);
        });
      });

      describe(`PATCH /api/airtable/content/${Table}/rec1234abcd`, () => {
        it('should return status code 404', async () => {
          // Given
          const method = 'PATCH';
          const url = `/api/airtable/content/${Table}/rec1234abcd`;

          // Then
          const response = await server.inject({
            method,
            url,
            headers ,
            payload: { param: 'value' }
          });

          // Then
          expect(response.statusCode).to.equal(404);
        });
      });

      describe(`DELETE /api/airtable/content/${Table}/rec1234abcd`, () => {
        it('should return status code 404', async () => {
          // Given
          const method = 'DELETE';
          const url = `/api/airtable/content/${Table}/rec1234abcd`;

          // Then
          const response = await server.inject({
            method,
            url,
            headers ,
            payload: { param: 'value' }
          });

          // Then
          expect(response.statusCode).to.equal(404);
        });
      });
    });
  });
});

async function createAdminUser() {
  const user = databaseBuilder.factory.buildAdminUser();
  await databaseBuilder.commit();
  return user;
}

async function createReadonlyUser() {
  const user = databaseBuilder.factory.buildReadonlyUser();
  await databaseBuilder.commit();
  return user;
}
