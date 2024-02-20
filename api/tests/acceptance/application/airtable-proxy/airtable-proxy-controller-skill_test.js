import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import nock from 'nock';
import {
  airtableBuilder,
  databaseBuilder,
  domainBuilder,
  generateAuthorizationHeader,
  inputOutputDataBuilder,
  knex,
} from '../../../test-helper.js';
import { createServer } from '../../../../server.js';

describe('Acceptance | Controller | airtable-proxy-controller | create skill translations', () => {
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

  describe('POST /api/airtable/content/Acquis', () => {
    let airtableRawSkill;
    let skillToSave;
    let user;

    beforeEach(async function() {
      user = databaseBuilder.factory.buildAdminUser();
      await databaseBuilder.commit();
      const skill = domainBuilder.buildSkillDatasourceObject({ id: 'mon_id_persistant' });
      airtableRawSkill = airtableBuilder.factory.buildSkill(skill);
      skillToSave = inputOutputDataBuilder.factory.buildSkill({
        ...skill,
        hint_i18n: {
          fr: 'Peut-on géo-localiser un téléphone lorsqu’il est éteint ?',
          en: 'Can we geo-locate a rabbit on the ice floe?',
        }
      });
    });

    describe('nominal cases', () => {
      it('should proxy request to airtable and add translations to the PG table', async () => {
        // Given
        nock('https://api.airtable.com')
          .post('/v0/airtableBaseValue/Acquis', airtableRawSkill)
          .matchHeader('authorization', 'Bearer airtableApiKeyValue')
          .reply(200, airtableRawSkill);
        const server = await createServer();

        // When
        const response = await server.inject({
          method: 'POST',
          url: '/api/airtable/content/Acquis',
          headers: generateAuthorizationHeader(user),
          payload: skillToSave,
        });

        // Then
        expect(response.statusCode).to.equal(200);
        const translations = await knex('translations').select().orderBy([{
          column: 'key',
          order: 'asc'
        }, { column: 'locale', order: 'asc' }]);

        expect(translations).to.deep.equal([{
          key: 'skill.mon_id_persistant.hint',
          locale: 'en',
          value: 'Can we geo-locate a rabbit on the ice floe?'
        }, {
          key: 'skill.mon_id_persistant.hint',
          locale: 'fr',
          value: 'Peut-on géo-localiser un téléphone lorsqu’il est éteint ?'
        }]);
      });
    });
  });

  describe('PATCH /api/airtable/content/Acquis/id_airtable', () => {
    let skillToUpdate;
    let airtableSkill;
    let user;

    beforeEach(async function() {
      user = databaseBuilder.factory.buildAdminUser();

      const skillDataObject = domainBuilder.buildSkillDatasourceObject({
        id: 'mon_id_persistant',
      });
      airtableSkill = airtableBuilder.factory.buildSkill(skillDataObject);
      skillToUpdate = inputOutputDataBuilder.factory.buildSkill({
        ...skillDataObject,
        hint_i18n: {
          fr: 'AAA',
          en: 'BBB',
        },
      });

      databaseBuilder.factory.buildTranslation({
        locale: 'fr',
        key: 'skill.mon_id_persistant.hint',
        value: 'Pouet'
      });
      databaseBuilder.factory.buildTranslation({
        locale: 'en',
        key: 'skill.mon_id_persistant.hint',
        value: 'Toot'
      });

      await databaseBuilder.commit();

    });

    describe('nominal cases', () => {
      it('should proxy request to airtable and update translations to the PG table', async () => {
        // Given
        nock('https://api.airtable.com')
          .patch('/v0/airtableBaseValue/Acquis/id_airtable', airtableSkill)
          .matchHeader('authorization', 'Bearer airtableApiKeyValue')
          .reply(200, airtableSkill);
        const server = await createServer();

        // When
        const response = await server.inject({
          method: 'PATCH',
          url: '/api/airtable/content/Acquis/id_airtable',
          headers: generateAuthorizationHeader(user),
          payload: skillToUpdate,
        });

        // Then
        expect(response.statusCode).to.equal(200);
        const translations = await knex('translations').select().orderBy([{
          column: 'key',
          order: 'asc'
        }, { column: 'locale', order: 'asc' }]);

        expect(translations).to.deep.equal([{
          key: 'skill.mon_id_persistant.hint',
          locale: 'en',
          value: 'BBB'
        }, {
          key: 'skill.mon_id_persistant.hint',
          locale: 'fr',
          value: 'AAA'
        }]);
      });
    });
  });
});

describe('Acceptance | Controller | airtable-proxy-controller | retrieve skill translations', () => {

  afterEach(() => {
    expect(nock.isDone()).to.be.true;
  });

  afterEach(function() {
    return knex('translations').truncate();
  });

  describe('GET /api/airtable/content/Acquis', () => {
    let skillDataObject;
    let airtableSkill;
    let user;

    beforeEach(async function() {
      user = databaseBuilder.factory.buildAdminUser();

      skillDataObject = domainBuilder.buildSkillDatasourceObject({
        id: 'mon_id_persistant',
      });
      airtableSkill = airtableBuilder.factory.buildSkill(skillDataObject);

      databaseBuilder.factory.buildTranslation({
        locale: 'fr',
        key: 'skill.mon_id_persistant.hint',
        value: 'AAA'
      });
      databaseBuilder.factory.buildTranslation({
        locale: 'en',
        key: 'skill.mon_id_persistant.hint',
        value: 'BBB'
      });

      await databaseBuilder.commit();
    });

    describe('nominal cases', () => {
      it('should proxy request to airtable and read translations from the PG table', async () => {
        // Given
        const expectedSkillDataObject = domainBuilder.buildSkillDatasourceObject({
          id: 'mon_id_persistant'
        });
        const expectedSkill = inputOutputDataBuilder.factory.buildSkill({
          ...expectedSkillDataObject,
          hint_i18n: {
            fr: 'AAA',
            en: 'BBB',
          }
        });
        nock('https://api.airtable.com')
          .get('/v0/airtableBaseValue/Acquis')
          .matchHeader('authorization', 'Bearer airtableApiKeyValue')
          .reply(200, { records: [airtableSkill] });
        const server = await createServer();

        // When
        const response = await server.inject({
          method: 'GET',
          url: '/api/airtable/content/Acquis',
          headers: generateAuthorizationHeader(user)
        });

        // Then
        expect(response.statusCode).to.equal(200);
        expect(response.result).to.deep.equal({ records: [expectedSkill] });
      });
    });
  });

  describe('GET /api/airtable/content/Acquis/id', () => {
    let skillDataObject;
    let airtableSkill;
    let user;

    beforeEach(async function() {
      user = databaseBuilder.factory.buildAdminUser();

      skillDataObject = domainBuilder.buildSkillDatasourceObject({
        id: 'mon_id_persistant',
      });
      airtableSkill = airtableBuilder.factory.buildSkill(skillDataObject);

      databaseBuilder.factory.buildTranslation({
        locale: 'fr',
        key: 'skill.mon_id_persistant.hint',
        value: 'Prout'
      });
      databaseBuilder.factory.buildTranslation({
        locale: 'en',
        key: 'skill.mon_id_persistant.hint',
        value: 'Fart'
      });

      await databaseBuilder.commit();
    });

    describe('nominal case', () => {
      it('should proxy request to airtable and read translations from the PG table', async () => {
        // Given
        const expectedSkillDataObject = domainBuilder.buildSkillDatasourceObject({
          id: 'mon_id_persistant',
        });
        const expectedSkill = inputOutputDataBuilder.factory.buildSkill({
          ...expectedSkillDataObject,
          hint_i18n: {
            fr: 'Prout',
            en: 'Fart'
          },
        });
        nock('https://api.airtable.com')
          .get('/v0/airtableBaseValue/Acquis/recId')
          .matchHeader('authorization', 'Bearer airtableApiKeyValue')
          .reply(200, airtableSkill);
        const server = await createServer();

        // When
        const response = await server.inject({
          method: 'GET',
          url: '/api/airtable/content/Acquis/recId',
          headers: generateAuthorizationHeader(user)
        });

        // Then
        expect(response.statusCode).to.equal(200);
        expect(response.result).to.deep.equal(expectedSkill);
      });
    });
  });
});
