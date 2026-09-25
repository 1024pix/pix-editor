import { beforeEach, describe, expect, it } from 'vitest';
import { databaseBuilder, domainBuilder, generateAuthorizationHeader } from '../../../test-helper.js';
import { createServer } from '../../../../server.js';

describe('Acceptance | Controller | broken-urls', () => {
  describe('GET /broken-urls', () => {
    let brokenUrl,
      challenge,
      framework,
      editorUser,
      externalUrl1,
      externalUrl2,
      externalUrl3,
      notFoundUrl,
      server;

    beforeEach(async function() {
      editorUser = databaseBuilder.factory.buildUser({ name: 'Madame Editor', access: 'editor' });
      ({ challenge, framework } = databaseBuilder.factory.buildChallengeInGroup({}));
      externalUrl1 = databaseBuilder.factory.buildExternalUrl({ localizedChallengeIds: [challenge.id], url: 'http://localhost:8080/', tutorialIds: [] });
      externalUrl2 = databaseBuilder.factory.buildExternalUrl({ localizedChallengeIds: [challenge.id], url: 'http://test.localhost:8080/', tutorialIds: [] });
      externalUrl3 = databaseBuilder.factory.buildExternalUrl({ localizedChallengeIds: [challenge.id], url: 'http://www.test.org', tutorialIds: [] });
      const savedNotFoundUrl = databaseBuilder.factory.buildBrokenUrl({
        id: '1',
        errorMessage: 'Not Found',
        statusCode: 404,
        url: externalUrl1.url,
      });
      const savedBrokenUrl = databaseBuilder.factory.buildBrokenUrl({
        id: '2',
        errorMessage: 'Tout cassé',
        statusCode: 500,
        url: externalUrl2.url,
      });
      const savedNotAllowedUrl = databaseBuilder.factory.buildBrokenUrl({
        id: '3',
        errorMessage: 'Pas le droit',
        statusCode: 401,
        url: externalUrl3.url,
      });

      notFoundUrl = domainBuilder.buildBrokenUrl({
        frameworkNames: [framework.name],
        ...savedNotFoundUrl,
      });
      brokenUrl = domainBuilder.buildBrokenUrl({
        frameworkNames: [framework.name],
        ...savedBrokenUrl,
      });
      // filtered out by whitelisted url
      domainBuilder.buildBrokenUrl({
        frameworkNames: [framework.name],
        ...savedNotAllowedUrl,
      });

      databaseBuilder.factory.buildWhitelistedUrl({
        checkType: 'exact_match',
        createdBy: editorUser.id,
        latestUpdatedBy: editorUser.id,
        relatedSkillNames: '@chocolat3',
        url: externalUrl3.url,
      });

      await databaseBuilder.commit();
      server = await createServer();
    });

    it('should return a 403 status code when user is not editor', async () => {
      // given
      const notEditorUser = databaseBuilder.factory.buildReadonlyUser();
      await databaseBuilder.commit();

      // when
      const response = await server.inject({
        method: 'GET',
        url: '/api/broken-urls',
        headers: generateAuthorizationHeader(notEditorUser),
      });

      // Then
      expect(response.statusCode).to.equal(403);
      expect(response.result).to.deep.equal({
        errors: [
          {
            code: 403,
            detail: 'Missing or insufficient permissions.',
            title: 'Forbidden access',
          },
        ],
      });
    });

    it('should return the broken url list filtered by whitelisted urls', async () => {
      // when
      const response = await server.inject({
        method: 'GET',
        url: '/api/broken-urls',
        headers: generateAuthorizationHeader(editorUser),
      });

      // Then
      expect(response.statusCode).to.equal(200);
      expect(response.result).to.deep.equal({
        data: [
          {
            id: notFoundUrl.id,
            attributes: {
              'error-message': notFoundUrl.errorMessage,
              'status-code': notFoundUrl.statusCode,
              url: notFoundUrl.url,
              frameworks: notFoundUrl.frameworkNames,
            },
            type: 'broken-urls',
            relationships: {
              'localized-challenges': {
                data: [
                  {
                    id: challenge.id,
                    type: 'localizedChallenges',
                  },
                ],
              },
              skills: { data: [] },
              tutorials: { data: [] },
            },
          },
          {
            id: brokenUrl.id,
            attributes: {
              'error-message': brokenUrl.errorMessage,
              'status-code': brokenUrl.statusCode,
              url: brokenUrl.url,
              frameworks: brokenUrl.frameworkNames,
            },
            type: 'broken-urls',
            relationships: {
              'localized-challenges': {
                data: [
                  {
                    id: challenge.id,
                    type: 'localizedChallenges',
                  },
                ],
              },
              skills: { data: [] },
              tutorials: { data: [] },
            },
          },
        ],
      });
    });
  });
});
