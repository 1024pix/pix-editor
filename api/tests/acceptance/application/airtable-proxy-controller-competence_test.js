const nock = require('nock');
const {
  airtableBuilder,
  expect,
  databaseBuilder,
  domainBuilder,
  generateAuthorizationHeader,
  knex,
} = require('../../test-helper');
const createServer = require('../../../server');

describe('Acceptance | Controller | airtable-proxy-controller | create translation', () => {
  describe('POST /api/airtable/content/Competences', () => {
    let competenceDataObject;
    let competence;
    let user;

    beforeEach(async function() {
      user = databaseBuilder.factory.buildAdminUser();
      await databaseBuilder.commit();
      competenceDataObject = domainBuilder.buildCompetenceAirtableDataObject({
        id: 'recCompetence',
      });
      competence =
        airtableBuilder.factory.buildCompetence(competenceDataObject);
    });

    describe('nominal cases', () => {
      it('should proxy request to airtable and add translations to the PG table', async () => {
        // Given
        nock('https://api.test.pix.fr').post('/*').reply(200);
        nock('https://api.airtable.com')
          .post('/v0/airtableBaseValue/Competences', competence)
          .matchHeader('authorization', 'Bearer airtableApiKeyValue')
          .reply(200, competence);
        const server = await createServer();

        // When
        const response = await server.inject({
          method: 'POST',
          url: '/api/airtable/content/Competences',
          headers: generateAuthorizationHeader(user),
          payload: competence,
        });

        // Then
        expect(response.statusCode).to.equal(200);
        expect(response.result).to.equal('ok');
        const [{ count }] = await knex('translations').count();
        expect(count).to.equal(1);
      });
    });
  });
});
