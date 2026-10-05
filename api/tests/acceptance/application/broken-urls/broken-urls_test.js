import { beforeEach, describe, expect, it } from 'vitest';
import { databaseBuilder, domainBuilder, generateAuthorizationHeader, knex } from '../../../test-helper.js';
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
      notAllowedUrl,
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
        ignored: false,
      });
      const savedBrokenUrl = databaseBuilder.factory.buildBrokenUrl({
        id: '2',
        errorMessage: 'Tout cassé',
        statusCode: 500,
        url: externalUrl2.url,
        ignored: false,
      });
      const savedNotAllowedUrl = databaseBuilder.factory.buildBrokenUrl({
        id: '3',
        errorMessage: 'Pas le droit',
        statusCode: 401,
        url: externalUrl3.url,
        ignored: true,
      });

      notFoundUrl = domainBuilder.buildBrokenUrlRead({
        frameworkNames: [framework.name],
        ...savedNotFoundUrl,
      });
      brokenUrl = domainBuilder.buildBrokenUrlRead({
        frameworkNames: [framework.name],
        ...savedBrokenUrl,
      });
      notAllowedUrl = domainBuilder.buildBrokenUrlRead({
        frameworkNames: [framework.name],
        ...savedNotAllowedUrl,
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

    it('should return the broken url list', async () => {
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
              ignored: notFoundUrl.ignored,
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
              ignored: brokenUrl.ignored,
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
            id: notAllowedUrl.id,
            attributes: {
              'error-message': notAllowedUrl.errorMessage,
              'status-code': notAllowedUrl.statusCode,
              url: notAllowedUrl.url,
              frameworks: notAllowedUrl.frameworkNames,
              ignored: notAllowedUrl.ignored,
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

  describe('PATCH /broken-urls/{brokenUrlId}', () => {
    it('should return a 403 status code when user is not editor', async () => {
      // given
      const notEditorUser = databaseBuilder.factory.buildReadonlyUser();
      await databaseBuilder.commit();
      const server = await createServer();

      // when
      const response = await server.inject({
        method: 'PATCH',
        url: '/api/broken-urls/123',
        headers: generateAuthorizationHeader(notEditorUser),
        payload: { data: { attributes: { ignored: true } } },
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

    it('should update the broken url with status code 200', async () => {
      // given
      const editorUser = databaseBuilder.factory.buildEditorUser();
      const existingBrokenUrl = databaseBuilder.factory.buildBrokenUrl({ id: 123 });

      await databaseBuilder.commit();
      const server = await createServer();

      // when
      const response = await server.inject({
        method: 'PATCH',
        url: `/api/broken-urls/${existingBrokenUrl.id}`,
        headers: generateAuthorizationHeader(editorUser),
        payload: { data: { attributes: { ignored: true } } },
      });

      // Then
      expect(response.statusCode).to.equal(200);
      const updatedBrokenUrl = await knex('broken_urls').where('id', existingBrokenUrl.id).first();
      expect(updatedBrokenUrl.ignored).toStrictEqual(true);
    });

    it('should update the broken url with status code 200', async () => {
      // given
      const editorUser = databaseBuilder.factory.buildEditorUser();
      const existingBrokenUrl = databaseBuilder.factory.buildBrokenUrl({ id: 123 });

      await databaseBuilder.commit();
      const server = await createServer();

      // when
      const response = await server.inject({
        method: 'PATCH',
        url: `/api/broken-urls/${existingBrokenUrl.id}`,
        headers: generateAuthorizationHeader(editorUser),
        payload: { data: { attributes: { ignored: false } } },
      });

      // Then
      expect(response.statusCode).to.equal(200);
      const updatedBrokenUrl = await knex('broken_urls').where('id', existingBrokenUrl.id).first();
      expect(updatedBrokenUrl.ignored).toStrictEqual(false);
    });
  });
});
