import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import nock from 'nock';
import {
  airtableBuilder,
  inputOutputDataBuilder,
  databaseBuilder,
  domainBuilder,
  generateAuthorizationHeader,
  knex,
} from '../../test-helper.js';
import { createServer } from '../../../server.js';

describe('Acceptance | Controller | airtable-proxy-controller | create area translations', () => {
  beforeEach(() => {
    nock('https://api.test.pix.fr').post(/.*/).reply(200);

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

  describe('POST /api/airtable/content/Domaines', () => {
    let airtableRawArea;
    let areaToSave;
    let user;

    beforeEach(async function() {
      user = databaseBuilder.factory.buildAdminUser();
      await databaseBuilder.commit();
      const area = domainBuilder.buildAreaDatasourceObject({ id: 'mon_id_persistant' });
      airtableRawArea = airtableBuilder.factory.buildArea({
        ...area,
        title_i18n: {
          fr: 'Domaine titre',
          en: 'Area title',
        }
      });
      areaToSave = inputOutputDataBuilder.factory.buildArea({
        ...area,
        title_i18n: {
          fr: 'Domaine titre',
          en: 'Area title',
        }
      });
    });

    describe('nominal cases', () => {
      it('should proxy request to airtable and add translations to the PG table', async () => {
        // Given
        nock('https://api.airtable.com')
          .post('/v0/airtableBaseValue/Domaines', airtableRawArea)
          .matchHeader('authorization', 'Bearer airtableApiKeyValue')
          .reply(200, airtableRawArea);
        const server = await createServer();

        // When
        const response = await server.inject({
          method: 'POST',
          url: '/api/airtable/content/Domaines',
          headers: generateAuthorizationHeader(user),
          payload: areaToSave,
        });

        // Then
        expect(response.statusCode).to.equal(200);
        const translations = await knex('translations').select().orderBy([{
          column: 'key',
          order: 'asc'
        }, { column: 'locale', order: 'asc' }]);

        expect(translations).to.deep.equal([{
          key: 'area.mon_id_persistant.title',
          locale: 'en',
          value: 'Area title'
        }, {
          key: 'area.mon_id_persistant.title',
          locale: 'fr',
          value: 'Domaine titre'
        }]);
      });
    });
  });
});

describe('Acceptance | Controller | airtable-proxy-controller | Retrieve area translations', () => {

  afterEach(() => {
    expect(nock.isDone()).to.be.true;
  });

  afterEach(function() {
    return knex('translations').truncate();
  });

  describe('GET /api/airtable/content/Domaines', () => {
    let areaDataObject;
    let airtableArea;
    let user;

    beforeEach(async function() {
      user = databaseBuilder.factory.buildAdminUser();

      areaDataObject = domainBuilder.buildAreaDatasourceObject({
        id: 'mon_id_persistant',
      });
      airtableArea = airtableBuilder.factory.buildArea(areaDataObject);

      databaseBuilder.factory.buildTranslation({
        locale: 'fr',
        key: 'area.mon_id_persistant.title',
        value: 'Titre de domaine dans PG'
      });
      databaseBuilder.factory.buildTranslation({
        locale: 'en',
        key: 'area.mon_id_persistant.title',
        value: 'Area title in PG'
      });

      await databaseBuilder.commit();
    });

    describe('nominal cases', () => {
      it('should proxy request to airtable and retrieve all areas', async () => {
        // Given
        const expectedAreaDataObject = domainBuilder.buildAreaDatasourceObject({
          id: 'mon_id_persistant'
        });
        const expectedArea = inputOutputDataBuilder.factory.buildArea({
          ...expectedAreaDataObject,
          title_i18n: {
            fr: 'Titre de domaine dans PG',
            en: 'Area title in PG',
          }
        });
        nock('https://api.airtable.com')
          .get('/v0/airtableBaseValue/Domaines')
          .matchHeader('authorization', 'Bearer airtableApiKeyValue')
          .reply(200, { records: [airtableArea] });
        const server = await createServer();

        // When
        const response = await server.inject({
          method: 'GET',
          url: '/api/airtable/content/Domaines',
          headers: generateAuthorizationHeader(user)
        });

        // Then
        expect(response.statusCode).to.equal(200);
        expect(response.result).to.deep.equal({ records: [expectedArea] });
      });
    });
  });

  describe('GET /api/airtable/content/Domaines/id', () => {
    let areaDataObject;
    let airtableArea;
    let user;

    beforeEach(async function() {
      user = databaseBuilder.factory.buildAdminUser();

      areaDataObject = domainBuilder.buildAreaDatasourceObject({
        id: 'mon_id_persistant',
      });
      airtableArea = airtableBuilder.factory.buildArea(areaDataObject);

      databaseBuilder.factory.buildTranslation({
        locale: 'fr',
        key: 'area.mon_id_persistant.title',
        value: 'Prout'
      });
      databaseBuilder.factory.buildTranslation({
        locale: 'en',
        key: 'area.mon_id_persistant.title',
        value: 'Fart'
      });

      await databaseBuilder.commit();
    });

    describe('nominal case', () => {
      it('should proxy request to airtable and retrieve area by id', async () => {
        // Given
        const expectedAreaDataObject = domainBuilder.buildAreaDatasourceObject({
          id: 'mon_id_persistant',
        });
        const expectedArea = inputOutputDataBuilder.factory.buildArea({
          ...expectedAreaDataObject,
          title_i18n: {
            fr: 'Prout',
            en: 'Fart',
          }
        });
        nock('https://api.airtable.com')
          .get('/v0/airtableBaseValue/Domaines/recId')
          .matchHeader('authorization', 'Bearer airtableApiKeyValue')
          .reply(200, airtableArea);
        const server = await createServer();

        // When
        const response = await server.inject({
          method: 'GET',
          url: '/api/airtable/content/Domaines/recId',
          headers: generateAuthorizationHeader(user)
        });

        // Then
        expect(response.statusCode).to.equal(200);
        expect(response.result).to.deep.equal(expectedArea);
      });
    });
  });
});
