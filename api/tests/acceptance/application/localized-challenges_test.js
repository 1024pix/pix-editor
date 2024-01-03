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
  });
});
