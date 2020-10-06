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

    });

  });

});

