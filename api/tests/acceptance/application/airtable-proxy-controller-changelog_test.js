import { describe, describe as context, expect, it } from 'vitest';
import nock from 'nock';
import { databaseBuilder, generateAuthorizationHeader } from '../../test-helper.js';
import { createServer } from '../../../server.js';

describe('Acceptance | Controller | airtable-proxy-controller-changelog', () => {
  describe('PATCH /api/airtable/changelog/Notes', () => {
    it('should proxy patch changelog to airtable', async () => {
      //Given
      const user = databaseBuilder.factory.buildAdminUser();
      await databaseBuilder.commit();

      nock('https://api.airtable.com')
        .patch('/v0/airtableEditorBaseValue/Notes', { param: 'value' })
        .matchHeader('authorization', 'Bearer airtableApiKeyValue')
        .matchHeader('content-type', 'application/json')
        .reply(200, 'ok');
      const server = await createServer();

      // When
      const response = await server.inject({
        method: 'PATCH',
        url: '/api/airtable/changelog/Notes',
        headers: generateAuthorizationHeader(user),
        payload: { param: 'value' }
      });

      // Then
      expect(response.statusCode).to.equal(200);
      expect(response.result).to.equal('ok');
    });

    it('should return airtable status code', async () => {
      //Given
      const user = databaseBuilder.factory.buildAdminUser();
      await databaseBuilder.commit();

      nock('https://api.airtable.com')
        .post('/v0/airtableEditorBaseValue/Notes', { param: 'value' })
        .matchHeader('authorization', 'Bearer airtableApiKeyValue')
        .matchHeader('content-type', 'application/json')
        .reply(401, 'Unauthorized');
      const server = await createServer();

      // When
      const response = await server.inject({
        method: 'POST',
        url: '/api/airtable/changelog/Notes',
        headers: generateAuthorizationHeader(user),
        payload: { param: 'value' }
      });

      // Then
      expect(response.statusCode).to.equal(401);
      expect(response.result).to.equal('Unauthorized');
    });

    context('when user is readonly', () => {
      it('should return a 403 error code', async () => {
        //Given
        const user = databaseBuilder.factory.buildReadonlyUser();
        await databaseBuilder.commit();

        const server = await createServer();

        // When
        const response = await server.inject({
          method: 'PATCH',
          url: '/api/airtable/changelog/Notes',
          headers: generateAuthorizationHeader(user),
          payload: { param: 'value' }
        });

        // Then
        expect(response.statusCode).to.equal(403);
      });
    });

  });
});
