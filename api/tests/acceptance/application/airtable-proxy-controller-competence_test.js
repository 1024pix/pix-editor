import nock from 'nock';
import {
  airtableBuilder,
  inputOutputDataBuilder,
  expect,
  databaseBuilder,
  domainBuilder,
  generateAuthorizationHeader,
  knex,
} from '../../test-helper.js';
import { createServer } from '../../../server.js';

describe('Acceptance | Controller | airtable-proxy-controller | create competence translations', () => {
  beforeEach(() => {
    nock('https://api.test.pix.fr').post(/.*/).reply(200);
    nock('https://api.test.pix.fr').patch(/.*/).reply(200);

    nock('https://api.airtable.com')
      .get(/^\/v0\/airtableBaseValue\/translations\?.*/)
      .matchHeader('authorization', 'Bearer airtableApiKeyValue')
      .optionally()
      .reply(404);
  });

  afterEach(async () => {
    try {
      expect(nock.isDone()).to.be.true;
    } finally {
      await knex('translations').truncate();
    }
  });

  describe('POST /api/airtable/content/Competences', () => {
    let airtableRawCompetence;
    let competenceToSave;
    let user;

    beforeEach(async function() {
      user = databaseBuilder.factory.buildAdminUser();
      await databaseBuilder.commit();
      const competence = domainBuilder.buildCompetenceDatasourceObject({ id: 'mon_id_persistant' });
      airtableRawCompetence = airtableBuilder.factory.buildCompetence(competence);
      competenceToSave = inputOutputDataBuilder.factory.buildCompetence({
        ... competence,
        name_i18n: {
          fr: 'Pouet',
          en: 'Toot'
        },
        description_i18n: {
          fr: 'C\'est le bruit d\'un klaxon',
          en: 'It is the sound of a klaxon',
        },
      });
    });

    describe('nominal cases', () => {
      it('should proxy request to airtable and add translations to the PG table', async () => {
        // Given
        nock('https://api.airtable.com')
          .post('/v0/airtableBaseValue/Competences', airtableRawCompetence)
          .matchHeader('authorization', 'Bearer airtableApiKeyValue')
          .reply(200, airtableRawCompetence);
        const server = await createServer();

        // When
        const response = await server.inject({
          method: 'POST',
          url: '/api/airtable/content/Competences',
          headers: generateAuthorizationHeader(user),
          payload: competenceToSave,
        });

        // Then
        expect(response.statusCode).to.equal(200);
        const translations = await knex('translations').select('key', 'locale', 'value');
        expect(translations.length).to.equal(4);
        expect(translations[0]).to.deep.equal({
          key: 'competence.mon_id_persistant.name',
          locale: 'fr',
          value: 'Pouet'
        });
        expect(translations[1]).to.deep.equal({
          key: 'competence.mon_id_persistant.description',
          locale: 'fr',
          value: 'C\'est le bruit d\'un klaxon'
        });
        expect(translations[2]).to.deep.equal({
          key: 'competence.mon_id_persistant.name',
          locale: 'en',
          value: 'Toot'
        });
        expect(translations[3]).to.deep.equal({
          key: 'competence.mon_id_persistant.description',
          locale: 'en',
          value: 'It is the sound of a klaxon'
        });
      });
    });
  });

  describe('PATCH /api/airtable/content/Competences/id_airtable', () => {
    let airtableRawCompetence;
    let competence;
    let user;

    beforeEach(async function() {
      user = databaseBuilder.factory.buildAdminUser();

      const competenceDataObject = domainBuilder.buildCompetenceDatasourceObject({
        id: 'mon_id_persistant',
      });
      airtableRawCompetence = airtableBuilder.factory.buildCompetence(competenceDataObject);
      competence = inputOutputDataBuilder.factory.buildCompetence({
        ...competenceDataObject,
        name_i18n: {
          fr: 'AAA',
          en: 'BBB',
        },
        description_i18n: {
          fr: 'CCCCCCCCCCCCCCCC',
          en: 'DDDDDDDDDDDDDDDD',
        },
      });

      databaseBuilder.factory.buildTranslation({
        locale: 'fr',
        key: 'competence.mon_id_persistant.name',
        value: 'Pouet'
      });
      databaseBuilder.factory.buildTranslation({
        locale: 'en',
        key: 'competence.mon_id_persistant.name',
        value: 'Toot'
      });
      databaseBuilder.factory.buildTranslation({
        locale: 'fr',
        key: 'competence.mon_id_persistant.description',
        value: 'C\'est le bruit d\'un klaxon'
      });
      databaseBuilder.factory.buildTranslation({
        locale: 'en',
        key: 'competence.mon_id_persistant.description',
        value: 'It is the sound of a klaxon'
      });

      await databaseBuilder.commit();

    });

    describe('nominal cases', () => {
      it('should proxy request to airtable and update translations to the PG table', async () => {
        // Given
        nock('https://api.airtable.com')
          .patch('/v0/airtableBaseValue/Competences/id_airtable', airtableRawCompetence)
          .matchHeader('authorization', 'Bearer airtableApiKeyValue')
          .reply(200, airtableRawCompetence);
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
        expect(translations[0]).to.deep.equal({
          key: 'competence.mon_id_persistant.name',
          locale: 'fr',
          value: 'AAA'
        });
        expect(translations[1]).to.deep.equal({
          key: 'competence.mon_id_persistant.description',
          locale: 'fr',
          value: 'CCCCCCCCCCCCCCCC'
        });
        expect(translations[2]).to.deep.equal({
          key: 'competence.mon_id_persistant.name',
          locale: 'en',
          value: 'BBB'
        });
        expect(translations[3]).to.deep.equal({
          key: 'competence.mon_id_persistant.description',
          locale: 'en',
          value: 'DDDDDDDDDDDDDDDD'
        });
      });
    });
  });

});

describe('Acceptance | Controller | airtable-proxy-controller | retrieve competence translations', () => {

  afterEach(() => {
    expect(nock.isDone()).to.be.true;
  });

  afterEach(function() {
    return knex('translations').truncate();
  });

  describe('GET /api/airtable/content/Competences', () => {
    let competenceDataObject;
    let competence;
    let user;

    beforeEach(async function() {
      user = databaseBuilder.factory.buildAdminUser();

      competenceDataObject = domainBuilder.buildCompetenceDatasourceObject({
        id: 'mon_id_persistant',
      });
      competence = inputOutputDataBuilder.factory.buildCompetence({
        ...competenceDataObject,
        name_i18n: {
          fr: 'Pouet',
          en: 'Toot',
        },
      });

      databaseBuilder.factory.buildTranslation({
        locale: 'fr',
        key: 'competence.mon_id_persistant.name',
        value: 'Prout'
      });
      databaseBuilder.factory.buildTranslation({
        locale: 'en',
        key: 'competence.mon_id_persistant.name',
        value: 'Fart'
      });

      await databaseBuilder.commit();
    });

    describe('nominal cases', () => {
      it('should proxy request to airtable and read translations to the PG table', async () => {
        // Given
        const expectedCompetenceDataObject = domainBuilder.buildCompetenceDatasourceObject({
          id: 'mon_id_persistant'
        });
        const expectedCompetence = inputOutputDataBuilder.factory.buildCompetence({
          ...expectedCompetenceDataObject,
          name_i18n: {
            fr: 'Prout',
            en: 'Fart'
          },
          description_i18n: {
            fr: null,
            en: null,
          },
        });
        nock('https://api.airtable.com')
          .get('/v0/airtableBaseValue/Competences')
          .matchHeader('authorization', 'Bearer airtableApiKeyValue')
          .reply(200, { records: [competence] });
        const server = await createServer();

        // When
        const response = await server.inject({
          method: 'GET',
          url: '/api/airtable/content/Competences',
          headers: generateAuthorizationHeader(user)
        });

        // Then
        expect(response.statusCode).to.equal(200);
        expect(response.result).to.deep.equal({ records: [expectedCompetence] });
      });
    });
  });

  describe('GET /api/airtable/content/Competences/id', () => {
    let competenceDataObject;
    let competence;
    let user;

    beforeEach(async function() {
      user = databaseBuilder.factory.buildAdminUser();

      competenceDataObject = domainBuilder.buildCompetenceDatasourceObject({
        id: 'mon_id_persistant',
      });
      competence = inputOutputDataBuilder.factory.buildCompetence({
        ...competenceDataObject,
        name_i18n: {
          fr: 'Pouet',
          en: 'Toot',
        },
      });

      databaseBuilder.factory.buildTranslation({
        locale: 'fr',
        key: 'competence.mon_id_persistant.name',
        value: 'Prout'
      });
      databaseBuilder.factory.buildTranslation({
        locale: 'en',
        key: 'competence.mon_id_persistant.name',
        value: 'Fart'
      });

      await databaseBuilder.commit();
    });

    describe('nominal case', () => {
      it('should proxy request to airtable and read translations to the PG table', async () => {
        // Given
        const expectedCompetenceDataObject = domainBuilder.buildCompetenceDatasourceObject({
          id: 'mon_id_persistant',
        });
        const expectedCompetence = inputOutputDataBuilder.factory.buildCompetence({
          ...expectedCompetenceDataObject,
          name_i18n: {
            fr: 'Prout',
            en: 'Fart'
          },
          description_i18n: {
            fr: null,
            en: null
          }
        });
        nock('https://api.airtable.com')
          .get('/v0/airtableBaseValue/Competences/recId')
          .matchHeader('authorization', 'Bearer airtableApiKeyValue')
          .reply(200, competence);
        const server = await createServer();

        // When
        const response = await server.inject({
          method: 'GET',
          url: '/api/airtable/content/Competences/recId',
          headers: generateAuthorizationHeader(user)
        });

        // Then
        expect(response.statusCode).to.equal(200);
        expect(response.result).to.deep.equal(expectedCompetence);
      });
    });
  });
});
