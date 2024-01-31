import { beforeEach, afterEach, describe, expect, it } from 'vitest';
import { airtableBuilder, knex } from '../test-helper.js';
import Airtable from 'airtable';
import nock from 'nock';

import { migrateAreasTranslationsFromAirtable } from '../../scripts/migrate-areas-translations-from-airtable/index.js';

describe('Script | Migrate areas translations from Airtable', function() {

  let airtableClient;

  beforeEach(() => {
    nock('https://api.airtable.com')
      .get(/^\/v0\/airtableBaseValue\/translations\?.*/)
      .matchHeader('authorization', 'Bearer airtableApiKeyValue')
      .optionally()
      .reply(404);

    airtableClient = new Airtable({
      apiKey: 'airtableApiKeyValue',
    }).base('airtableBaseValue');
  });

  afterEach(async () => {
    await knex('translations').truncate();
  });

  it('fills translations table', async function() {
    // given
    const areas = [
      airtableBuilder.factory.buildArea({
        id: 'recArea51',
        code: '51',
      }),
      airtableBuilder.factory.buildArea({
        id: 'recArea52',
        code: '52',
      }),
    ];

    areas[0].fields['Titre fr-fr'] = 'La zone 51';
    areas[0].fields['Titre en-us'] = 'The 51 area';
    areas[0].fields['Name'] = '51. La zone 51';
    areas[1].fields['Titre fr-fr'] = 'La zone 52';
    areas[1].fields['Titre en-us'] = 'The 52 area';
    areas[1].fields['Name'] = '52. La zone 52';

    nock('https://api.airtable.com')
      .get('/v0/airtableBaseValue/Domaines')
      .matchHeader('authorization', 'Bearer airtableApiKeyValue')
      .query(true)
      .reply(200, { records: areas });

    // when
    await migrateAreasTranslationsFromAirtable({ airtableClient });

    // then
    await expect(
      knex('translations').select().orderBy([
        { column: 'key', order: 'asc' },
        { column: 'locale', order: 'asc' },
      ]),
    ).resolves.toEqual([
      {
        key: 'area.recArea51.title',
        locale: 'en',
        value: areas[0].fields['Titre en-us'],
      },
      {
        key: 'area.recArea51.title',
        locale: 'fr',
        value: areas[0].fields['Titre fr-fr'],
      },
      {
        key: 'area.recArea52.title',
        locale: 'en',
        value: areas[1].fields['Titre en-us'],
      },
      {
        key: 'area.recArea52.title',
        locale: 'fr',
        value: areas[1].fields['Titre fr-fr'],
      },
    ]);
  });
});
