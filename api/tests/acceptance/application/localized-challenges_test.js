import { describe, expect, it } from 'vitest';
import { databaseBuilder, generateAuthorizationHeader } from '../../test-helper.js';
import { createServer } from '../../../server.js';

describe('Acceptance | Controller | localized-challenges-controller', () => {
  describe('GET /localized-challenges/{id}', () => {
    it.fails('should get a localized challenge by ID', async () => {
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
});
