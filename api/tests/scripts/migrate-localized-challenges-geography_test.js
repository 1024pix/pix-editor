import { describe, expect, it } from 'vitest';
import nock from 'nock';

import { databaseBuilder, knex } from '../test-helper';

import { migrateLocalizedChallengesGeography } from '../../scripts/migrate-localized-challenges-geography';
import { LocalizedChallenge } from '../../lib/domain/models/index.js';

describe('Script | migrate-localized-challenges-geography', () => {

  it('should copy geography field from airtable to PG', async () => {
    // given
    databaseBuilder.factory.buildLocalizedChallenge({
      id: 'recChallenge1',
      challengeId: 'recChallenge1',
      status: LocalizedChallenge.STATUSES.PRIMARY,
    });
    databaseBuilder.factory.buildLocalizedChallenge({
      id: 'recChallenge1Nl',
      challengeId: 'recChallenge1',
      locale: 'nl',
      status: LocalizedChallenge.STATUSES.PLAY,
    });
    databaseBuilder.factory.buildLocalizedChallenge({
      id: 'recChallenge2',
      challengeId: 'recChallenge2',
      status: LocalizedChallenge.STATUSES.PRIMARY,
    });
    databaseBuilder.factory.buildLocalizedChallenge({
      id: 'recChallenge2Nl',
      challengeId: 'recChallenge2',
      locale: 'nl',
      status: LocalizedChallenge.STATUSES.PAUSE,
    });
    databaseBuilder.factory.buildLocalizedChallenge({
      id: 'recChallenge3',
      challengeId: 'recChallenge3',
      status: LocalizedChallenge.STATUSES.PRIMARY,
    });
    databaseBuilder.factory.buildLocalizedChallenge({
      id: 'recChallenge4',
      challengeId: 'recChallenge4',
      status: LocalizedChallenge.STATUSES.PRIMARY,
    });
    databaseBuilder.factory.buildLocalizedChallenge({
      id: 'recChallenge5',
      challengeId: 'recChallenge5',
      status: LocalizedChallenge.STATUSES.PRIMARY,
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
        urlsToConsult: null,
        status: LocalizedChallenge.STATUSES.PRIMARY,
        requireGafamWebsiteAccess: false,
        isIncompatibleIpadCertif: false,
        deafAndHardOfHearing: LocalizedChallenge.DEAF_AND_HARD_OF_HEARING_VALUES.RAS,
        isAwarenessChallenge: false,
        toRephrase: false,
      },
      {
        id: 'recChallenge1Nl',
        challengeId: 'recChallenge1',
        geography: null,
        locale: 'nl',
        embedUrl: null,
        urlsToConsult: null,
        status: LocalizedChallenge.STATUSES.PLAY,
        requireGafamWebsiteAccess: false,
        isIncompatibleIpadCertif: false,
        deafAndHardOfHearing: LocalizedChallenge.DEAF_AND_HARD_OF_HEARING_VALUES.RAS,
        isAwarenessChallenge: false,
        toRephrase: false,
      },
      {
        id: 'recChallenge2',
        challengeId: 'recChallenge2',
        geography: 'TM',
        locale: 'fr',
        embedUrl: null,
        urlsToConsult: null,
        status: LocalizedChallenge.STATUSES.PRIMARY,
        requireGafamWebsiteAccess: false,
        isIncompatibleIpadCertif: false,
        deafAndHardOfHearing: LocalizedChallenge.DEAF_AND_HARD_OF_HEARING_VALUES.RAS,
        isAwarenessChallenge: false,
        toRephrase: false,
      },
      {
        id: 'recChallenge2Nl',
        challengeId: 'recChallenge2',
        geography: null,
        locale: 'nl',
        embedUrl: null,
        urlsToConsult: null,
        status: LocalizedChallenge.STATUSES.PAUSE,
        requireGafamWebsiteAccess: false,
        isIncompatibleIpadCertif: false,
        deafAndHardOfHearing: LocalizedChallenge.DEAF_AND_HARD_OF_HEARING_VALUES.RAS,
        isAwarenessChallenge: false,
        toRephrase: false,
      },
      {
        id: 'recChallenge3',
        challengeId: 'recChallenge3',
        geography: 'DE',
        locale: 'fr',
        embedUrl: null,
        urlsToConsult: null,
        status: LocalizedChallenge.STATUSES.PRIMARY,
        requireGafamWebsiteAccess: false,
        isIncompatibleIpadCertif: false,
        deafAndHardOfHearing: LocalizedChallenge.DEAF_AND_HARD_OF_HEARING_VALUES.RAS,
        isAwarenessChallenge: false,
        toRephrase: false,
      },
      {
        id: 'recChallenge4',
        challengeId: 'recChallenge4',
        geography: 'CI',
        locale: 'fr',
        embedUrl: null,
        urlsToConsult: null,
        status: LocalizedChallenge.STATUSES.PRIMARY,
        requireGafamWebsiteAccess: false,
        isIncompatibleIpadCertif: false,
        deafAndHardOfHearing: LocalizedChallenge.DEAF_AND_HARD_OF_HEARING_VALUES.RAS,
        isAwarenessChallenge: false,
        toRephrase: false,
      },
      {
        id: 'recChallenge5',
        challengeId: 'recChallenge5',
        geography: 'CG',
        locale: 'fr',
        embedUrl: null,
        urlsToConsult: null,
        status: LocalizedChallenge.STATUSES.PRIMARY,
        requireGafamWebsiteAccess: false,
        isIncompatibleIpadCertif: false,
        deafAndHardOfHearing: LocalizedChallenge.DEAF_AND_HARD_OF_HEARING_VALUES.RAS,
        isAwarenessChallenge: false,
        toRephrase: false,
      },
    ]);
  });
});
