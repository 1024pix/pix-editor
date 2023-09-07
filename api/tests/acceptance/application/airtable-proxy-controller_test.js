const nock = require('nock');
const {
  expect,
  airtableBuilder,
  databaseBuilder,
  inputOutputDataBuilder,
  domainBuilder,
  generateAuthorizationHeader
} = require('../../test-helper');
const createServer = require('../../../server');

describe('Acceptance | Controller | airtable-proxy-controller', () => {

  describe('GET/POST/PUT/DELETE /api/airtable/content/Competences', () => {

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

    describe('nominal cases', () => {

      it('should proxy request to airtable', async () => {
        // Given
        const user = await createReadonlyUser();
        const competenceDataObject = domainBuilder.buildCompetenceDatasourceObject();
        const competence = airtableBuilder.factory.buildCompetence(competenceDataObject);
        const inputOutputCompetence = inputOutputDataBuilder.factory.buildCompetence({
          ...competenceDataObject,
          name_i18n: {
            en: null,
            fr: null,
          },
          description_i18n: {
            en: null,
            fr: null,
          },
        });
        nock('https://api.airtable.com')
          .get('/v0/airtableBaseValue/Competences?key=value')
          .matchHeader('authorization', 'Bearer airtableApiKeyValue')
          .reply(200, competence);
        const server = await createServer();

        // When
        const response = await server.inject({
          method: 'GET',
          url: '/api/airtable/content/Competences?key=value',
          headers: generateAuthorizationHeader(user)
        });

        // Then
        expect(response.statusCode).to.equal(200);
        expect(response.result).to.deep.equal(inputOutputCompetence);
      });

      it('should proxy post request to airtable', async () => {
        // Given
        const user = await createAdminUser();
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
    });

    describe('error cases', () => {

      it('should return airtable error status code', async () => {
        // Given
        const user = await createAdminUser();
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

      it('should forbid POST request with readonly access', async () => {
        // Given
        const user = await createReadonlyUser();
        const server = await createServer();

        // When
        const response = await server.inject({
          method: 'POST',
          url: '/api/airtable/content/Epreuves?key=value',
          headers: generateAuthorizationHeader(user),
          payload: { param: 'value' }
        });

        // Then
        expect(response.statusCode).to.equal(403);
      });
    });

  });

});
