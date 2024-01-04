import { beforeEach, afterEach, describe, expect, it } from 'vitest';
import { knex } from '../test-helper.js';
import Airtable from 'airtable';
import nock from 'nock';
import {
  migrateEmbedTitleTranslationFromAirtable
} from '../../scripts/migrate-embed-title-translation-from-airtable/index.js';

describe('Migrate translation from airtable', function() {

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
    const challenge = {
      id: 'airtableChallengeId',
      fields: {
        'id persistant': 'challengeid1',
        'Embed title': 'Embed title',
        Langues: ['Franco Français'],
      }
    };
    const challengeWithEmptyEmbedTitle = {
      id: 'airtableChallengeId',
      fields: {
        'id persistant': 'challengeid2',
        'Embed title': '',
        Langues: ['Franco Français'],
      }
    };

    const challenges = [challenge, challengeWithEmptyEmbedTitle];

    nock('https://api.airtable.com')
      .get('/v0/airtableBaseValue/Epreuves')
      .matchHeader('authorization', 'Bearer airtableApiKeyValue')
      .query({
        fields: {
          '': [
            'id persistant',
            'Embed title',
            'Langues',
          ]
        }
      })
      .reply(200, { records: challenges });

    // when
    await migrateEmbedTitleTranslationFromAirtable({ airtableClient });

    // then
    const translations = await knex('translations').select().orderBy([{
      column: 'key',
      order: 'asc'
    }, { column: 'locale', order: 'asc' }]);

    expect(translations).to.have.lengthOf(1);
    expect(translations).to.deep.equal([
      {
        key: 'challenge.challengeid1.embedTitle',
        locale: 'fr-fr',
        value: 'Embed title'
      },
    ]);
  });
});
