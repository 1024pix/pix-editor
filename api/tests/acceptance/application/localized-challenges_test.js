import { describe, expect, it } from 'vitest';
import { databaseBuilder, generateAuthorizationHeader, knex } from '../../test-helper.js';
import { createServer } from '../../../server.js';
import { LocalizedChallenge } from '../../../lib/domain/models/index.js';

describe('Acceptance | Controller | localized-challenges-controller', () => {
  describe('GET /localized-challenges/{id}', () => {
    it.fails('should get a localized challenge by ID', async () => {
      // given
      const user = databaseBuilder.factory.buildAdminUser();
      databaseBuilder.factory.buildLocalizedChallenge({
        challengeId: 'recChallenge0',
        id: 'recChallenge0',
        locale: 'fr',
        embedUrl: 'https://choucroute.com/?lang=fr',
        status: 'proposé',
        urlsToConsult: null,
      });
      const localizedChallenge = databaseBuilder.factory.buildLocalizedChallenge({
        challengeId: 'recChallenge0',
        id: 'localizedChallengeId',
        locale: 'nl',
        embedUrl: 'https://choucroute.com/le-nl-c-est-ici',
        status: LocalizedChallenge.STATUSES.PAUSE,
        urlsToConsult: null,
      });

      await databaseBuilder.commit();

      const server = await createServer();
      const getLocalizedChallengeOptions = {
        method: 'GET',
        url: '/api/localized-challenges/localizedChallengeId',
        headers: generateAuthorizationHeader(user),
      };

      const expectedLocalizedChallenges = {
        data: {
          type: 'localized-challenges',
          id: localizedChallenge.id,
          attributes: {
            locale: localizedChallenge.locale,
            'embed-url': localizedChallenge.embedUrl,
            'default-embed-url': 'https://choucroute.com/?lang=nl',
            geography: 'Neutre',
            status: localizedChallenge.status,
            translations: `/api/challenges/${localizedChallenge.challengeId}/translations/${localizedChallenge.locale}`,
            'urls-to-consult': null,
          },
          relationships: {
            challenge: {
              data: {
                id: localizedChallenge.challengeId,
                type: 'challenges',
              },
            },
            files: {
              data: [],
            },
          },
        }
      };

      // When
      const response = await server.inject(getLocalizedChallengeOptions);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result).to.deep.equal(expectedLocalizedChallenges);
    });
  });

  describe('GET /localized-challenges', () => {
    it.fails('should filter one localized challenge by ID', async () => {
      // given
      const user = databaseBuilder.factory.buildAdminUser();
      databaseBuilder.factory.buildLocalizedChallenge({
        challengeId: 'recChallenge0',
        id: 'recChallenge0',
        locale: 'fr',
        embedUrl: 'https://choucroute.com/',
      });
      const localizedChallenge = databaseBuilder.factory.buildLocalizedChallenge({
        challengeId: 'recChallenge0',
        id: 'localizedChallengeId',
        locale: 'nl',
        embedUrl: 'https://choucroute.com/',
      });

      await databaseBuilder.commit();

      const server = await createServer();
      const getLocalizedChallengeOptions = {
        method: 'GET',
        url: '/api/localized-challenges?filter[ids][]=localizedChallengeId',
        headers: generateAuthorizationHeader(user),
      };

      const expectedLocalizedChallenges = {
        data: [{
          type: 'localized-challenges',
          id: localizedChallenge.id,
          attributes: {
            'locale': localizedChallenge.locale,
            'embed-url': localizedChallenge.embedUrl,
            'default-embed-url': 'https://choucroute.com/?lang=nl',
            status: null,
            geography: 'Neutre',
            translations: `/api/challenges/${localizedChallenge.challengeId}/translations/${localizedChallenge.locale}`,
            'urls-to-consult': null,
          },
          relationships: {
            challenge: {
              data: {
                id: localizedChallenge.challengeId,
                type: 'challenges',
              },
            },
            files: {
              data: [],
            },
          },
        }]
      };

      // When
      const response = await server.inject(getLocalizedChallengeOptions);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result).to.deep.equal(expectedLocalizedChallenges);
    });

    it.fails('should filter several localized challenges by IDs', async () => {
      // given
      const user = databaseBuilder.factory.buildAdminUser();

      databaseBuilder.factory.buildLocalizedChallenge({
        challengeId: 'recChallenge0',
        id: 'recChallenge0',
        locale: 'fr',
        embedUrl: 'https://choucroute.com/',
      });
      databaseBuilder.factory.buildLocalizedChallenge({
        challengeId: 'recChallenge1',
        id: 'recChallenge1',
        locale: 'fr',
        embedUrl: 'https://raclette.com/',
      });

      const localizedChallenges = [
        databaseBuilder.factory.buildLocalizedChallenge({
          challengeId: 'recChallenge0',
          id: 'localizedChallengeId0',
          locale: 'nl',
          embedUrl: 'https://choucroute.com/',
        }),
        databaseBuilder.factory.buildLocalizedChallenge({
          challengeId: 'recChallenge1',
          id: 'localizedChallengeId1',
          locale: 'de',
          embedUrl: 'https://raclette.com/',
        }),
      ];

      await databaseBuilder.commit();

      const server = await createServer();
      const getLocalizedChallengeOptions = {
        method: 'GET',
        url: '/api/localized-challenges?filter[ids][]=localizedChallengeId0&filter[ids][]=localizedChallengeId1',
        headers: generateAuthorizationHeader(user),
      };

      const expectedLocalizedChallenges = {
        data: [
          {
            type: 'localized-challenges',
            id: localizedChallenges[0].id,
            attributes: {
              'locale': localizedChallenges[0].locale,
              'embed-url': localizedChallenges[0].embedUrl,
              'default-embed-url': 'https://choucroute.com/?lang=nl',
              geography: 'Neutre',
              status: null,
              translations: `/api/challenges/${localizedChallenges[0].challengeId}/translations/${localizedChallenges[0].locale}`,
              'urls-to-consult': null,
            },
            relationships: {
              challenge: {
                data: {
                  id: localizedChallenges[0].challengeId,
                  type: 'challenges',
                },
              },
              files: {
                data: [],
              },
            },
          },
          {
            type: 'localized-challenges',
            id: localizedChallenges[1].id,
            attributes: {
              'locale': localizedChallenges[1].locale,
              'embed-url': localizedChallenges[1].embedUrl,
              'default-embed-url': 'https://raclette.com/?lang=de',
              geography: 'Neutre',
              status: null,
              translations: `/api/challenges/${localizedChallenges[1].challengeId}/translations/${localizedChallenges[1].locale}`,
              'urls-to-consult': null,
            },
            relationships: {
              challenge: {
                data: {
                  id: localizedChallenges[1].challengeId,
                  type: 'challenges',
                },
              },
              files: {
                data: [],
              },
            },
          }
        ]
      };

      // When
      const response = await server.inject(getLocalizedChallengeOptions);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result).to.deep.equal(expectedLocalizedChallenges);
    });
  });

  describe('PATCH /localized-challenges/{id}', () => {
    it('should modify localized challenge of given ID', async () => {
      // given
      const user = databaseBuilder.factory.buildAdminUser();
      databaseBuilder.factory.buildLocalizedChallenge({
        challengeId: 'recChallenge0',
        id: 'recChallenge0',
        locale: 'fr',
        embedUrl: 'https://choucroute.com/',
      });
      const localizedChallenge = databaseBuilder.factory.buildLocalizedChallenge({
        challengeId: 'recChallenge0',
        id: 'localizedChallengeId',
        locale: 'nl',
        embedUrl: null,
        requireGafamWebsiteAccess: true,
        isIncompatibleIpadCertif: true,
        deafAndHardOfHearing: LocalizedChallenge.DEAF_AND_HARD_OF_HEARING_VALUES.OK,
        isAwarenessChallenge: true,
        toRephrase: true,
        status: LocalizedChallenge.STATUSES.PAUSE,
      });

      await databaseBuilder.commit();

      const server = await createServer();
      const patchLocalizedChallengeOptions = {
        method: 'PATCH',
        url: '/api/localized-challenges/localizedChallengeId',
        headers: generateAuthorizationHeader(user),
        payload: {
          data: {
            type: 'localized-challenges',
            id: localizedChallenge.id,
            attributes: {
              'embed-url': 'https://cassoulet.com/',
              locale: 'should-not-update',
              'challenge-id': 'should-not-update',
              'require-gafam-website-access': false,
              'is-incompatible-ipad-certif': false,
              'deaf-and-hard-of-hearing': LocalizedChallenge.DEAF_AND_HARD_OF_HEARING_VALUES.KO,
              'is-awareness-challenge': false,
              'to-rephrase': false,
              status: LocalizedChallenge.STATUSES.PLAY,
            },
          },
        },
      };

      // When
      const response = await server.inject(patchLocalizedChallengeOptions);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result.data).to.deep.equal({
        type: 'localized-challenges',
        id: 'localizedChallengeId',
        attributes: {
          'default-embed-url': 'https://choucroute.com/?lang=nl',
          'embed-url': 'https://cassoulet.com/',
          geography: 'Neutre',
          locale: 'nl',
          status: LocalizedChallenge.STATUSES.PLAY,
          translations: '/api/challenges/recChallenge0/translations/nl',
          'urls-to-consult': null,
          'require-gafam-website-access': false,
          'is-incompatible-ipad-certif': false,
          'deaf-and-hard-of-hearing': LocalizedChallenge.DEAF_AND_HARD_OF_HEARING_VALUES.KO,
          'is-awareness-challenge': false,
          'to-rephrase': false,
        },
        relationships: {
          challenge: {
            data: {
              type: 'challenges',
              id: 'recChallenge0',
            },
          },
          files: {
            data: [],
          },
        },
      });
      const updatedLocalizedChallenge = await knex('localized_challenges').select().where({ id: localizedChallenge.id }).first();
      expect(updatedLocalizedChallenge).to.deep.equal({
        id: localizedChallenge.id,
        challengeId: localizedChallenge.challengeId,
        locale: 'nl',
        embedUrl: 'https://cassoulet.com/',
        status: LocalizedChallenge.STATUSES.PLAY,
        geography: null,
        urlsToConsult: null,
        requireGafamWebsiteAccess: false,
        isIncompatibleIpadCertif: false,
        deafAndHardOfHearing: LocalizedChallenge.DEAF_AND_HARD_OF_HEARING_VALUES.KO,
        isAwarenessChallenge: false,
        toRephrase: false,
      });
    });

    it('should return forbidden error when user is read-only', async () => {
      // Given
      const readOnlyUser = databaseBuilder.factory.buildReadonlyUser();
      await databaseBuilder.commit();
      const server = await createServer();

      // When
      const response = await server.inject({
        method: 'PATCH',
        url: '/api/localized-challenges/123',
        headers: generateAuthorizationHeader(readOnlyUser),
        payload: {}
      });

      // Then
      expect(response.statusCode).to.equal(403);
    });

    it('should return forbidden error if user is NOT admin and updates status', async() => {
      // given
      const user = databaseBuilder.factory.buildEditorUser();
      databaseBuilder.factory.buildLocalizedChallenge({
        challengeId: 'recChallenge0',
        id: 'recChallenge0',
        locale: 'fr',
        status: 'proposé',
        embedUrl: 'https://choucroute.com/',
      });
      databaseBuilder.factory.buildLocalizedChallenge({
        challengeId: 'recChallenge0',
        id: 'localizedChallengeId',
        locale: 'nl',
        status: LocalizedChallenge.STATUSES.PAUSE,
        embedUrl: 'https://choucroute.com/',
      });
      await databaseBuilder.commit();

      const server = await createServer();
      const patchLocalizedChallengeOptions = {
        method: 'PATCH',
        url: '/api/localized-challenges/localizedChallengeId',
        headers: generateAuthorizationHeader(user),
        payload: {
          data: {
            type: 'localized-challenges',
            id: 'localizedChallengeId',
            attributes: {
              'status': LocalizedChallenge.STATUSES.PLAY,
            },
          },
        },
      };

      // When
      const response = await server.inject(patchLocalizedChallengeOptions);

      // Then
      expect(response.statusCode).to.equal(403);
    });
  });
});
