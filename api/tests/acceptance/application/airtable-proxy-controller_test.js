import { describe, expect, it } from 'vitest';
import nock from 'nock';
import {
  databaseBuilder,
  generateAuthorizationHeader
} from '../../test-helper.js';
import { createServer } from '../../../server.js';

describe('Acceptance | Controller | airtable-proxy-controller', () => {

  describe('POST /api/airtable/content/{Table}', () => {

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

    describe('error cases', () => {

      it('should return airtable error status code', async () => {
        // Given
        const user = await createAdminUser();
        nock('https://api.airtable.com')
          .post('/v0/airtableBaseValue/Entites', { param: 'value' })
          .matchHeader('authorization', 'Bearer airtableApiKeyValue')
          .matchHeader('content-type', 'application/json')
          .reply(401, 'Unauthorized');
        const server = await createServer();

        // When
        const response = await server.inject({
          method: 'POST',
          url: '/api/airtable/content/Entites',
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
          url: '/api/airtable/content/Entites',
          headers: generateAuthorizationHeader(user),
          payload: { param: 'value' }
        });

        // Then
        expect(response.statusCode).to.equal(403);
      });
    });
  });
});
