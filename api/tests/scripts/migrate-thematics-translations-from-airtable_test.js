import { beforeEach, afterEach, describe, expect, it } from 'vitest';
import { airtableBuilder, knex } from '../test-helper.js';
import Airtable from 'airtable';
import nock from 'nock';

import { migrateThematicsTranslationsFromAirtable } from '../../scripts/migrate-thematics-translations-from-airtable/index.js';

describe('Script | Migrate thematics translations from Airtable', function() {

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
    const thematic1FromAirtable = airtableBuilder.factory.buildThematic({
      id: 'thematicId1',
      airtableId: 'airtableThematicId1',
    });
    thematic1FromAirtable.fields = {
      ...thematic1FromAirtable.fields,
      'Nom': 'name 1 fr',
      'Titre en-us': 'name 1 en',
    };

    const thematic2FromAirtable = airtableBuilder.factory.buildThematic({
      airtableId: 'airtableThematicId2',
      id: 'thematicId2',
    });
    thematic2FromAirtable.fields = {
      ...thematic2FromAirtable.fields,
      'Nom': 'name 2 fr',
      'Titre en-us': 'name 2 en',
    };

    const thematics = [thematic1FromAirtable, thematic2FromAirtable];

    nock('https://api.airtable.com')
      .get('/v0/airtableBaseValue/Thematiques')
      .matchHeader('authorization', 'Bearer airtableApiKeyValue')
      .query(true)
      .reply(200, { records: thematics });

    // when
    await migrateThematicsTranslationsFromAirtable({ airtableClient });

    // then
    await expect(
      knex('translations').select().orderBy([
        { column: 'key', order: 'asc' },
        { column: 'locale', order: 'asc' },
      ]),
    ).resolves.toEqual([
      {
        key: 'thematic.thematicId1.name',
        locale: 'en',
        value: thematics[0].fields['Titre en-us'],
      },
      {
        key: 'thematic.thematicId1.name',
        locale: 'fr',
        value: thematics[0].fields['Nom'],
      },
      {
        key: 'thematic.thematicId2.name',
        locale: 'en',
        value: thematics[1].fields['Titre en-us'],
      },
      {
        key: 'thematic.thematicId2.name',
        locale: 'fr',
        value: thematics[1].fields['Nom'],
      },
    ]);
  });
});
