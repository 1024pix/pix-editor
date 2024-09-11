import { beforeEach, afterEach, describe, expect, it } from 'vitest';
import { airtableBuilder, knex } from '../test-helper.js';
import Airtable from 'airtable';
import nock from 'nock';

import { migrateTubesTranslationsFromAirtable } from '../../scripts/migrate-tubes-translations-from-airtable/index.js';

describe('Script | Migrate tubes translations from Airtable', function() {

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
    const tube1FromAirtable = airtableBuilder.factory.buildTube({
      id: 'tubeId1',
    });
    tube1FromAirtable.fields = {
      ...tube1FromAirtable.fields,
      'Titre pratique fr-fr': 'practicalTitleFrTubeId1',
      'Titre pratique en-us': 'practicalTitleEnUsTubeId1',
      'Description pratique fr-fr': 'practicalDescriptionFrTubeId1',
      'Description pratique en-us': 'practicalDescriptionEnUsTubeId1',
    };

    const tube2FromAirtable = airtableBuilder.factory.buildTube({
      id: 'tubeId2',
    });
    tube2FromAirtable.fields = {
      ...tube2FromAirtable.fields,
      'Titre pratique fr-fr': 'practicalTitleFrTubeId2',
      'Titre pratique en-us': 'practicalTitleEnUsTubeId2',
      'Description pratique fr-fr': 'practicalDescriptionFrTubeId2',
      'Description pratique en-us': 'practicalDescriptionEnUsTubeId2',
    };

    const tubes = [tube1FromAirtable, tube2FromAirtable];

    nock('https://api.airtable.com')
      .get('/v0/airtableBaseValue/Tubes')
      .matchHeader('authorization', 'Bearer airtableApiKeyValue')
      .query(true)
      .reply(200, { records: tubes });

    // when
    await migrateTubesTranslationsFromAirtable({ airtableClient });

    // then
    await expect(
      knex('translations').select('key', 'locale', 'value').orderBy([
        { column: 'key', order: 'asc' },
        { column: 'locale', order: 'asc' },
      ]),
    ).resolves.toEqual([
      {
        key: 'tube.tubeId1.practicalDescription',
        locale: 'en',
        value: tubes[0].fields['Description pratique en-us'],
      },
      {
        key: 'tube.tubeId1.practicalDescription',
        locale: 'fr',
        value: tubes[0].fields['Description pratique fr-fr'],
      },
      {
        key: 'tube.tubeId1.practicalTitle',
        locale: 'en',
        value: tubes[0].fields['Titre pratique en-us'],
      },
      {
        key: 'tube.tubeId1.practicalTitle',
        locale: 'fr',
        value: tubes[0].fields['Titre pratique fr-fr'],
      },
      {
        key: 'tube.tubeId2.practicalDescription',
        locale: 'en',
        value: tubes[1].fields['Description pratique en-us'],
      },
      {
        key: 'tube.tubeId2.practicalDescription',
        locale: 'fr',
        value: tubes[1].fields['Description pratique fr-fr'],
      },
      {
        key: 'tube.tubeId2.practicalTitle',
        locale: 'en',
        value: tubes[1].fields['Titre pratique en-us'],
      },
      {
        key: 'tube.tubeId2.practicalTitle',
        locale: 'fr',
        value: tubes[1].fields['Titre pratique fr-fr'],
      },
    ]);
  });
});
