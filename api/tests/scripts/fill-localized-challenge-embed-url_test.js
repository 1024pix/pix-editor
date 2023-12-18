import { beforeEach, afterEach, describe, expect, it } from 'vitest';
import Airtable from 'airtable';
import nock from 'nock';
import { knex, databaseBuilder } from '../test-helper.js';
import { fillLocalizedChallengesEmbedUrl } from '../../scripts/fill-localized-challenge-embed-url';

describe('Fill `embedUrl` localized challenges from airtable', function() {
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

  it('should fill `embedUrl` localized challenges from airtable ', async () => {
    // given
    const challenge1 = {
      id: 'airtableChallengeId',
      fields: {
        'id persistant': 'challengeid1',
        'Embed URL': 'my-embed-url-challengeid1',
      }
    };
    databaseBuilder.factory.buildLocalizedChallenge({
      id: 'challengeid1',
      challengeId: 'challengeid1',
      embedUrl: '',
    });

    databaseBuilder.factory.buildLocalizedChallenge({
      id: 'challengeid2',
      challengeId: 'challengeid1',
      locale: 'nl',
      embedUrl: '',
    });

    await databaseBuilder.commit();

    nock('https://api.airtable.com')
      .get('/v0/airtableBaseValue/Epreuves')
      .matchHeader('authorization', 'Bearer airtableApiKeyValue')
      .query({
        fields: {
          '': [
            'id persistant',
            'Embed URL',
          ]
        }
      })
      .reply(200, { records: [challenge1] });

    // when
    await fillLocalizedChallengesEmbedUrl({ airtableClient });

    // then
    const localizedChallenges = await knex('localized_challenges').select('id', 'locale', 'challengeId', 'embedUrl').orderBy('id');

    expect(localizedChallenges).to.deep.equal([
      {
        id: 'challengeid1',
        challengeId: 'challengeid1',
        locale: 'fr',
        embedUrl: 'my-embed-url-challengeid1',
      },
      {
        id: 'challengeid2',
        challengeId: 'challengeid1',
        locale: 'nl',
        embedUrl: '',
      },
    ]);
  });
});
