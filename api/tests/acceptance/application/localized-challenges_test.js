import { describe, expect, it } from 'vitest';
import { databaseBuilder, generateAuthorizationHeader, knex } from '../../test-helper.js';
import { createServer } from '../../../server.js';

describe('Acceptance | Controller | localized-challenges-controller', () => {
  describe('GET /localized-challenges/{id}', () => {
    it('should get a localized challenge by ID', async () => {
      // given
      const user = databaseBuilder.factory.buildAdminUser();
      const localizedChallenge = databaseBuilder.factory.buildLocalizedChallenge({
        challengeId: 'recChallenge0',
        id: 'localizedChallengeId',
        locale: 'nl',
        embedUrl: 'https://choucroute.com/',
        status: 'proposé'
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
            'locale': localizedChallenge.locale,
            'embed-url': localizedChallenge.embedUrl,
            'status': localizedChallenge.status,
          },
          relationships: {
            challenge: {
              data: {
                id: localizedChallenge.challengeId,
                type: 'challenges',
              },
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
    it('should find a localized challenge by ID', async () => {
      // given
      const user = databaseBuilder.factory.buildAdminUser();
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
            status: null,
          },
          relationships: {
            challenge: {
              data: {
                id: localizedChallenge.challengeId,
                type: 'challenges',
              },
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

    it('should filter several localized challenges by IDs', async () => {
      // given
      const user = databaseBuilder.factory.buildAdminUser();
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
              status: null,
            },
            relationships: {
              challenge: {
                data: {
                  id: localizedChallenges[0].challengeId,
                  type: 'challenges',
                },
              },
            },
          },
          {
            type: 'localized-challenges',
            id: localizedChallenges[1].id,
            attributes: {
              'locale': localizedChallenges[1].locale,
              'embed-url': localizedChallenges[1].embedUrl,
              status: null,
            },
            relationships: {
              challenge: {
                data: {
                  id: localizedChallenges[1].challengeId,
                  type: 'challenges',
                },
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
      const localizedChallenge = databaseBuilder.factory.buildLocalizedChallenge({
        challengeId: 'recChallenge0',
        id: 'localizedChallengeId',
        locale: 'nl',
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
            id: localizedChallenge.id,
            attributes: {
              'embed-url': 'https://cassoulet.com/',
              locale: 'should-not-update',
              'challenge-id': 'should-not-update',
            },
          },
        },
      };

      // When
      const response = await server.inject(patchLocalizedChallengeOptions);

      // then
      expect(response.statusCode).to.equal(200);

      const updatedLocalizedChallenge = await knex('localized_challenges').select().where({ id: localizedChallenge.id }).first();
      expect(updatedLocalizedChallenge).to.deep.equal({
        id: localizedChallenge.id,
        challengeId: localizedChallenge.challengeId,
        locale: 'nl',
        embedUrl: 'https://cassoulet.com/',
        status: null,
      });
    });

    it('should not update a challenge when i am a read-only user', async () => {
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
      await expect(response.statusCode).to.equal(403);
    });

    it('should modify localized challenge status of given ID', async () => {
      // given
      const user = databaseBuilder.factory.buildAdminUser();
      const localizedChallenge = databaseBuilder.factory.buildLocalizedChallenge({
        challengeId: 'recChallenge0',
        id: 'localizedChallengeId',
        locale: 'nl',
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
            id: localizedChallenge.id,
            attributes: {
              'status': 'validé',
            },
          },
        },
      };

      // When
      const response = await server.inject(patchLocalizedChallengeOptions);

      // then
      expect(response.statusCode).to.equal(200);

      const updatedLocalizedChallenge = await knex('localized_challenges').select().where({ id: localizedChallenge.id }).first();
      expect(updatedLocalizedChallenge).to.deep.equal({
        id: localizedChallenge.id,
        challengeId: localizedChallenge.challengeId,
        locale: 'nl',
        embedUrl: 'https://choucroute.com/',
        status: 'validé',
      });
    });

  });
});
