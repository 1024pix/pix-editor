import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createServer } from '../../../server.js';
import { HttpTestServer } from '../../tooling/server/http-test-server.js';
import { checkChallengeIsAlternative } from '../../../lib/application/security-pre-handlers.js';
import { databaseBuilder } from '../../test-helper.js';
import { Challenge } from '../../../lib/domain/models/Challenge.js';

describe('Acceptance | Application | SecurityPreHandlers', () => {
  let server;

  beforeEach(async () => {
    server = await createServer();
  });

  describe('#checkUserIsAuthenticatedViaBearer', () => {
    it('should disallow access resource with well formed JSON API error', async () => {
      // given
      const options = {
        method: 'GET',
        url: '/api/config',
      };

      // when
      const response = await server.inject(options);

      // then
      const jsonApiError = {
        errors: [
          {
            code: 401,
            title: 'Unauthorized access',
            detail: 'Missing or invalid access token in request auhorization headers.',
          },
        ],
      };
      expect(response.statusCode).to.equal(401);
      expect(response.result).to.deep.equal(jsonApiError);
    });
  });

  describe('#checkChallengeIsAlternative', () => {
    let prototypeChallengeId, alternativeChallengeId, httpServerTest;
    const handlerStub = vi.fn().mockReturnValue(true);

    beforeEach(async () => {
      const moduleUnderTest = {
        name: 'check-challenge-is-alternative',
        register: async function(server) {
          server.route([
            {
              method: 'GET',
              path: '/api/tests/check-challenge-is-alternative/{challengeId}',
              handler: handlerStub,
              config: {
                auth: false,
                pre: [{ method: checkChallengeIsAlternative }],
              },
            },
          ]);
        },
      };

      httpServerTest = new HttpTestServer();
      await httpServerTest.register(moduleUnderTest);

      const { challenge } = databaseBuilder.factory.buildChallengeInGroup(
        {
          challenge: { genealogy: Challenge.GENEALOGIES.PROTOTYPE },
          localizedChallenge: { locale: 'fr' },
        });
      prototypeChallengeId = challenge.id;

      const alternativeChallenge = databaseBuilder.factory.buildChallenge(
        {
          id: 'alternativeChallendId',
          skillId: challenge.skillId,
          genealogy: Challenge.GENEALOGIES.DECLINAISON,
          locales: ['fr'],
        });
      alternativeChallengeId = alternativeChallenge.id;
      databaseBuilder.factory.buildLocalizedChallenge(
        {
          id: alternativeChallengeId,
          challengeId: alternativeChallengeId,
          locale: 'fr',
        });
      await databaseBuilder.commit();
    });

    describe('when challenge is Prototype', () => {
      it('should throw a ForbiddenError', async () => {
        // given
        const options = {
          method: 'GET',
          url: `/api/tests/check-challenge-is-alternative/${prototypeChallengeId}`,
        };
        // given
        const result = await httpServerTest.requestObject(options);

        // then
        expect(result.statusCode).to.equal(403);
        expect(handlerStub).not.toHaveBeenCalled();
      });
    });

    describe('when challenge does not exist', () => {
      it('should throw a ForbiddenError', async () => {
        // given
        const options = {
          method: 'GET',
          url: '/api/tests/check-challenge-is-alternative/123',
        };
        // given
        const result = await httpServerTest.requestObject(options);

        // then
        expect(result.statusCode).to.equal(404);
        expect(handlerStub).not.toHaveBeenCalled();
      });
    });

    describe('when challenge is Alternative', () => {
      it('should return OK', async () => {
        // given
        const options = {
          method: 'GET',
          url: `/api/tests/check-challenge-is-alternative/${alternativeChallengeId}`,
        };
        // given
        const result = await httpServerTest.requestObject(options);

        // then
        expect(handlerStub).toHaveBeenCalled();
        expect(result.statusCode).to.equal(200);
      });
    });
  });
});
