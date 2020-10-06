const nock = require('nock');
const { expect, databaseBuilder, generateAuthorizationHeader } = require('../../test-helper');
const createServer = require('../../../server');

describe('Acceptance | Controller | airtable-proxy-controller', () => {

  describe('GET /api/airtable/content/Competences', () => {
    context('nominal case', () => {
      let user;
      beforeEach(async function() {
        user = databaseBuilder.factory.buildUser({ name: 'User', trigram: 'ABC', access: 'admin', apiKey:'11b2cab8-050e-4165-8064-29a1e58d8997' });
        await databaseBuilder.commit();
        nock('https://api.airtable.com')
          .get('/v0/airtableBaseValue/Competences?key=value')
          .matchHeader('authorization', 'Bearer airtableApiKeyValue')
          .reply(200, 'ok');
      });

      afterEach(function() {
        nock.cleanAll();
      });

      it('should proxy request to airtable', async () => {
        // Given
        const server = await createServer();

        // When
        const response = await server.inject({
          method: 'GET',
          url: '/api/airtable/content/Competences?key=value',
          headers: generateAuthorizationHeader(user)
        });

        // Then
        expect(response.statusCode).to.equal(200);
        expect(response.result).to.equal('ok');
      });

      it('should proxy post request to airtable', async () => {
        //Given
        nock('https://api.airtable.com')
          .post('/v0/airtableBaseValue/Epreuves?key=value', { param: 'value' })
          .matchHeader('authorization', 'Bearer airtableApiKeyValue')
          .matchHeader('content-type', 'application/json')
          .reply(200, 'ok');
        const server = await createServer();

        // When
        const response = await server.inject({
          method: 'POST',
          url: '/api/airtable/content/Epreuves?key=value',
          headers: generateAuthorizationHeader(user),
          payload: { param: 'value' }
        });

        // Then
        expect(response.statusCode).to.equal(200);
        expect(response.result).to.equal('ok');
      });

      it('should return airtable error status code', async () => {
        //Given
        nock('https://api.airtable.com')
          .post('/v0/airtableBaseValue/Epreuves?key=value', { param: 'value' })
          .matchHeader('authorization', 'Bearer airtableApiKeyValue')
          .matchHeader('content-type', 'application/json')
          .reply(401, 'Unauthorized');
        const server = await createServer();

        // When
        const response = await server.inject({
          method: 'POST',
          url: '/api/airtable/content/Epreuves?key=value',
          headers: generateAuthorizationHeader(user),
          payload: { param: 'value' }
        });

        // Then
        expect(response.statusCode).to.equal(401);
        expect(response.result).to.equal('Unauthorized');
      });

    });

  });

});

