import {  describe, expect, it } from 'vitest';
import nock from 'nock';

import { databaseBuilder, knex } from '../test-helper';

import { migrateLocalizedChallengesGeography } from '../../scripts/migrate-localized-challenges-geography';

describe('Script | migrate-localized-challenges-geography', () => {

  it('should copy geography field from airtable to PG', async () => {
    // given
    databaseBuilder.factory.buildLocalizedChallenge({
      id: 'recChallenge1',
      challengeId: 'recChallenge1',
    });
    databaseBuilder.factory.buildLocalizedChallenge({
      id: 'recChallenge1Nl',
      challengeId: 'recChallenge1',
      locale: 'nl',
    });
    databaseBuilder.factory.buildLocalizedChallenge({
      id: 'recChallenge2',
      challengeId: 'recChallenge2',
    });
    databaseBuilder.factory.buildLocalizedChallenge({
      id: 'recChallenge2Nl',
      challengeId: 'recChallenge2',
      locale: 'nl',
    });
    databaseBuilder.factory.buildLocalizedChallenge({
      id: 'recChallenge3',
      challengeId: 'recChallenge3',
    });
    databaseBuilder.factory.buildLocalizedChallenge({
      id: 'recChallenge4',
      challengeId: 'recChallenge4',
    });
    databaseBuilder.factory.buildLocalizedChallenge({
      id: 'recChallenge5',
      challengeId: 'recChallenge5',
    });
    await databaseBuilder.commit();

    nock('https://api.airtable.com')
      .get('/v0/airtableBaseValue/Epreuves')
      .matchHeader('authorization', 'Bearer airtableApiKeyValue')
      .query({
        fields: {
          '': [
            'id persistant',
            'Géographie',
          ]
        },
        filterByFormula: 'AND({Géographie} != \'\', {Géographie} != \'Neutre\', {Géographie} != \'Institutions internationales\')'
      })
      .reply(200, { records: [
        { id: 'challenge2', fields: { 'id persistant': 'recChallenge2', Géographie: 'Turkménistan' } },
        { id: 'challenge3', fields: { 'id persistant': 'recChallenge3', Géographie: 'Allemagne' } },
        { id: 'challenge4', fields: { 'id persistant': 'recChallenge4', Géographie: 'cote d\'ivoire' } },
        { id: 'challenge5', fields: { 'id persistant': 'recChallenge5', Géographie: 'congo' } },
      ] });

    // when
    await migrateLocalizedChallengesGeography();

    // then
    expect(nock.isDone()).toBe(true);
    await expect(knex('localized_challenges').select().orderBy('id')).resolves.toEqual([
      {
        id: 'recChallenge1',
        challengeId: 'recChallenge1',
        geography: null,
        locale: 'fr',
        embedUrl: null,
        status: null,
      },
      {
        id: 'recChallenge1Nl',
        challengeId: 'recChallenge1',
        geography: null,
        locale: 'nl',
        embedUrl: null,
        status: null,
      },
      {
        id: 'recChallenge2',
        challengeId: 'recChallenge2',
        geography: 'TM',
        locale: 'fr',
        embedUrl: null,
        status: null,
      },
      {
        id: 'recChallenge2Nl',
        challengeId: 'recChallenge2',
        geography: null,
        locale: 'nl',
        embedUrl: null,
        status: null,
      },
      {
        id: 'recChallenge3',
        challengeId: 'recChallenge3',
        geography: 'DE',
        locale: 'fr',
        embedUrl: null,
        status: null,
      },
      {
        id: 'recChallenge4',
        challengeId: 'recChallenge4',
        geography: 'CI',
        locale: 'fr',
        embedUrl: null,
        status: null,
      },
      {
        id: 'recChallenge5',
        challengeId: 'recChallenge5',
        geography: 'CG',
        locale: 'fr',
        embedUrl: null,
        status: null,
      },
    ]);
  });
});
