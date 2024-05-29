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

describe('Acceptance | Controller | airtable-proxy-controller | write thematic', () => {
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

  describe('POST /api/airtable/content/Thematiques', () => {
    let airtableRawThematic;
    let thematicToSave;
    let user;

    beforeEach(async function() {
      user = databaseBuilder.factory.buildAdminUser();
      await databaseBuilder.commit();
      const thematic = domainBuilder.buildThematicDatasourceObject({ id: 'mon_id_persistant' });
      airtableRawThematic = airtableBuilder.factory.buildThematic(thematic);
      thematicToSave = inputOutputDataBuilder.factory.buildThematic({
        ...thematic,
        name_i18n: {
          fr: 'téma tique',
          en: 'look tic',
        },
      });
    });

    it('should proxy request to airtable and add translations to the PG table', async () => {
      // Given
      nock('https://api.airtable.com')
        .post('/v0/airtableBaseValue/Thematiques', airtableRawThematic)
        .matchHeader('authorization', 'Bearer airtableApiKeyValue')
        .reply(200, airtableRawThematic);
      const server = await createServer();

      // When
      const response = await server.inject({
        method: 'POST',
        url: '/api/airtable/content/Thematiques',
        headers: generateAuthorizationHeader(user),
        payload: thematicToSave,
      });

      // Then
      expect(response.statusCode).to.equal(200);

      await expect(
        knex('translations')
          .select()
          .orderBy([
            { column: 'key', order: 'asc' },
            { column: 'locale', order: 'asc' },
          ])
      ).resolves.toEqual([
        {
          key: 'thematic.mon_id_persistant.name',
          locale: 'en',
          value: thematicToSave.fields['Titre en-us'],
        }, {
          key: 'thematic.mon_id_persistant.name',
          locale: 'fr',
          value: thematicToSave.fields['Nom'],
        },
      ]);
    });
  });

  describe('PATCH /api/airtable/content/Thematiques/id_airtable', () => {
    let thematicToUpdate;
    let airtableThematic;
    let user;

    beforeEach(async function() {
      user = databaseBuilder.factory.buildAdminUser();

      const thematicDataObject = domainBuilder.buildThematicDatasourceObject({ id: 'mon_id_persistant' });
      airtableThematic = airtableBuilder.factory.buildThematic(thematicDataObject);
      thematicToUpdate = inputOutputDataBuilder.factory.buildThematic({
        ...thematicDataObject,
        name_i18n: {
          fr: 'new french name',
          en: 'new english name',
        },
      });

      databaseBuilder.factory.buildTranslation({
        locale: 'fr',
        key: 'thematic.mon_id_persistant.name',
        value: 'old french name'
      });
      databaseBuilder.factory.buildTranslation({
        locale: 'en',
        key: 'thematic.mon_id_persistant.name',
        value: 'old english name'
      });

      await databaseBuilder.commit();
    });

    it('should proxy request to airtable and update translations to the PG table', async () => {
      // Given
      nock('https://api.airtable.com')
        .patch('/v0/airtableBaseValue/Thematiques/id_airtable', airtableThematic)
        .matchHeader('authorization', 'Bearer airtableApiKeyValue')
        .reply(200, airtableThematic);
      const server = await createServer();

      // When
      const response = await server.inject({
        method: 'PATCH',
        url: '/api/airtable/content/Thematiques/id_airtable',
        headers: generateAuthorizationHeader(user),
        payload: thematicToUpdate,
      });

      // Then
      expect(response.statusCode).to.equal(200);

      await expect(
        knex('translations').select().orderBy([{
          column: 'key',
          order: 'asc'
        }, { column: 'locale', order: 'asc' }])
      ).resolves.toEqual([{
        key: 'thematic.mon_id_persistant.name',
        locale: 'en',
        value: 'new english name'
      }, {
        key: 'thematic.mon_id_persistant.name',
        locale: 'fr',
        value: 'new french name'
      }]);
    });
  });
});

describe('Acceptance | Controller | airtable-proxy-controller | read thematics', () => {
  let thematicDataObject;
  let airtableThematic;
  let outputThematic;
  let user;

  beforeEach(async function() {
    user = databaseBuilder.factory.buildAdminUser();

    thematicDataObject = domainBuilder.buildThematicDatasourceObject({
      id: 'mon_id_persistant',
    });
    airtableThematic = airtableBuilder.factory.buildThematic(thematicDataObject);

    outputThematic = inputOutputDataBuilder.factory.buildThematic({
      ...thematicDataObject,
      name_i18n: {
        fr: 'french name',
        en: 'english name',
      },
    });

    databaseBuilder.factory.buildTranslation({
      locale: 'fr',
      key: 'thematic.mon_id_persistant.name',
      value: 'french name'
    });
    databaseBuilder.factory.buildTranslation({
      locale: 'en',
      key: 'thematic.mon_id_persistant.name',
      value: 'english name'
    });

    await databaseBuilder.commit();
  });

  afterEach(() => {
    expect(nock.isDone()).to.be.true;
  });

  describe('GET /api/airtable/content/Thematiques', () => {
    it('should proxy request to airtable and read translations from the PG table for a list of thematics', async () => {
      // Given
      nock('https://api.airtable.com')
        .get('/v0/airtableBaseValue/Thematiques')
        .matchHeader('authorization', 'Bearer airtableApiKeyValue')
        .reply(200, { records: [airtableThematic] });
      const server = await createServer();

      // When
      const response = await server.inject({
        method: 'GET',
        url: '/api/airtable/content/Thematiques',
        headers: generateAuthorizationHeader(user),
      });

      // Then
      expect(response.statusCode).to.equal(200);
      expect(response.result).to.deep.equal({ records: [outputThematic] });
    });
  });

  describe('GET /api/airtable/content/Thematiques/:id', () => {
    it('should proxy request to airtable and read translations from the PG table for one thematic', async () => {
      // Given
      nock('https://api.airtable.com')
        .get('/v0/airtableBaseValue/Thematiques/recId')
        .matchHeader('authorization', 'Bearer airtableApiKeyValue')
        .reply(200, airtableThematic);
      const server = await createServer();

      // When
      const response = await server.inject({
        method: 'GET',
        url: '/api/airtable/content/Thematiques/recId',
        headers: generateAuthorizationHeader(user)
      });

      // Then
      expect(response.statusCode).to.equal(200);
      expect(response.result).to.deep.equal(outputThematic);
    });
  });
});
