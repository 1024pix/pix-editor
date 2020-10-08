const nock = require('nock');
const { expect, databaseBuilder, generateAuthorizationHeader } = require('../../test-helper');
const createServer = require('../../../server');

describe('Acceptance | Controller | airtable-proxy-controller-changelog', () => {
  describe('PATCH /api/airtable/changelog/Notes', () => {
    let user;
    beforeEach(async function() {
      user = databaseBuilder.factory.buildUser({ name: 'User', trigram: 'ABC', access: 'admin', apiKey: '11b2cab8-050e-4165-8064-29a1e58d8997' });
      await databaseBuilder.commit();
    });

    afterEach(function() {
      nock.cleanAll();
    });

    it('should proxy patch changelog to airtable', async () => {
      //Given
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

  });
});
