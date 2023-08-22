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
        id: 'mon_id_persistant',
        name_i18n: {
          fr: 'Pouet',
          en: 'Toot'
        },
        description_i18n: {
          fr: 'C\'est le bruit d\'un klaxon',
          en: 'It is the sound of a klaxon'
        }
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
        const translations = await knex('translations').select('key', 'lang', 'value');
        expect(translations.length).to.equal(4);
        expect(translations[0]).to.deep.equal({ key: 'competence.mon_id_persistant.title', lang: 'fr', value: 'Pouet' });
        expect(translations[1]).to.deep.equal({ key: 'competence.mon_id_persistant.description', lang: 'fr', value: 'C\'est le bruit d\'un klaxon' });
        expect(translations[2]).to.deep.equal({ key: 'competence.mon_id_persistant.title', lang: 'en', value: 'Toot' });
        expect(translations[3]).to.deep.equal({ key: 'competence.mon_id_persistant.description', lang: 'en', value: 'It is the sound of a klaxon' });
      });
    });
  });
});
