import { beforeEach, afterEach, describe, expect, it } from 'vitest';
import { knex } from '../test-helper.js';
import Airtable from 'airtable';
import nock from 'nock';
import {
  fillLocalizedChallenges
} from '../../scripts/fill-localized-challenges/index.js';

describe.only('Fill localized challenges from airtable', function() {

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
    await knex('localized_challenges').truncate();
  });

  it('fills localized_challenges table from airtable', async function() {
    // given
    const challenge1 = {
      id: 'airtableChallengeId',
      fields: {
        'id persistant': 'challengeid1',
        Langues: ['Franco Français'],
      }
    };

    const challenge2 = {
      id: 'airtableChallengeId2',
      fields: {
        'id persistant': 'challengeid2',
        Langues: ['Franco Français', 'Francophone'],
      }
    };

    const challenges = [challenge1, challenge2];

    nock('https://api.airtable.com')
      .get('/v0/airtableBaseValue/Epreuves')
      .matchHeader('authorization', 'Bearer airtableApiKeyValue')
      .query({
        fields: {
          '': [
            'id persistant',
            'Langues',
          ]
        }
      })
      .reply(200, { records: challenges });

    // when
    await fillLocalizedChallenges({ airtableClient });

    // then
    const localizedChallenges = await knex('localized_challenges').select().orderBy([{
      column: 'id',
      order: 'asc'
    }, { column: 'locale', order: 'asc' }]);

    expect(localizedChallenges).to.have.lengthOf(2);
    expect(localizedChallenges).to.deep.equal([
      {
        id: 'challengeid1',
        challengeId: 'challengeid1',
        locale: 'fr-fr',
      },
      {
        id: 'challengeid2',
        challengeId: 'challengeid2',
        locale: 'fr',
      }
    ]);
  });
});
