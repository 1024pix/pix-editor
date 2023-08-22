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
  beforeEach(() => {
    nock('https://api.test.pix.fr').post(/.*/).reply(200);
    nock('https://api.test.pix.fr').patch(/.*/).reply(200);
  });

  afterEach(() => {
    expect(nock.isDone()).to.be.true;
  });

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

    afterEach(function() {
      return knex('translations').truncate();
    });

    describe('nominal cases', () => {
      it('should proxy request to airtable and add translations to the PG table', async () => {
        // Given
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
        const translations = await knex('translations').select('key', 'locale', 'value');
        expect(translations.length).to.equal(4);
        expect(translations[0]).to.deep.equal({ key: 'competence.mon_id_persistant.title', locale: 'fr', value: 'Pouet' });
        expect(translations[1]).to.deep.equal({ key: 'competence.mon_id_persistant.description', locale: 'fr', value: 'C\'est le bruit d\'un klaxon' });
        expect(translations[2]).to.deep.equal({ key: 'competence.mon_id_persistant.title', locale: 'en', value: 'Toot' });
        expect(translations[3]).to.deep.equal({ key: 'competence.mon_id_persistant.description', locale: 'en', value: 'It is the sound of a klaxon' });
      });
    });
  });

  describe('PATCH /api/airtable/content/Competences/id_airtable', () => {
    let competenceDataObject;
    let competence;
    let user;

    beforeEach(async function() {
      user = databaseBuilder.factory.buildAdminUser();

      competenceDataObject = domainBuilder.buildCompetenceAirtableDataObject({
        id: 'mon_id_persistant',
        name_i18n: {
          fr: 'AAA',
          en: 'BBB',
        },
        description_i18n: {
          fr: 'CCCCCCCCCCCCCCCC',
          en: 'DDDDDDDDDDDDDDDD',
        },
      });
      competence = airtableBuilder.factory.buildCompetence(competenceDataObject);

      databaseBuilder.factory.buildTranslation({ locale: 'fr', key:'competence.mon_id_persistant.title', value: 'Pouet' });
      databaseBuilder.factory.buildTranslation({ locale: 'en', key:'competence.mon_id_persistant.title', value: 'Toot' });
      databaseBuilder.factory.buildTranslation({ locale: 'fr', key:'competence.mon_id_persistant.description', value: 'C\'est le bruit d\'un klaxon' });
      databaseBuilder.factory.buildTranslation({ locale: 'en', key:'competence.mon_id_persistant.description', value: 'It is the sound of a klaxon' });

      await databaseBuilder.commit();

    });

    afterEach(function() {
      return knex('translations').truncate();
    });

    describe('nominal cases', () => {
      it('should proxy request to airtable and update translations to the PG table', async () => {
        // Given
        nock('https://api.airtable.com')
          .patch('/v0/airtableBaseValue/Competences/id_airtable', competence)
          .matchHeader('authorization', 'Bearer airtableApiKeyValue')
          .reply(200, competence);
        const server = await createServer();

        // When
        const response = await server.inject({
          method: 'PATCH',
          url: '/api/airtable/content/Competences/id_airtable',
          headers: generateAuthorizationHeader(user),
          payload: competence,
        });

        // Then
        expect(response.statusCode).to.equal(200);
        const translations = await knex('translations').select('key', 'locale', 'value');
        expect(translations.length).to.equal(4);
        expect(translations[0]).to.deep.equal({ key: 'competence.mon_id_persistant.title', locale: 'fr', value: 'AAA' });
        expect(translations[1]).to.deep.equal({ key: 'competence.mon_id_persistant.description', locale: 'fr', value: 'CCCCCCCCCCCCCCCC' });
        expect(translations[2]).to.deep.equal({ key: 'competence.mon_id_persistant.title', locale: 'en', value: 'BBB' });
        expect(translations[3]).to.deep.equal({ key: 'competence.mon_id_persistant.description', locale: 'en', value: 'DDDDDDDDDDDDDDDD' });
      });
    });
  });
});
