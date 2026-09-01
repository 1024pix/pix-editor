import { beforeEach, describe, expect, it } from 'vitest';
import { databaseBuilder, generateAuthorizationHeader } from '../../../test-helper.js';
import { createServer } from '../../../../server.js';

describe('Acceptance | Controller | broken-urls', () => {
  describe('GET /broken-urls', () => {
    let editorUser, server, notFoundUrl, brokenUrl, notAllowedUrl;

    beforeEach(async function() {
      editorUser = databaseBuilder.factory.buildUser({ name: 'Madame Editor', access: 'editor' });
      notFoundUrl = databaseBuilder.factory.buildBrokenUrl({
        id: '1',
        errorMessage: 'Not Found',
        statusCode: 404,
        url: 'http://localhost:8080/',
      });
      brokenUrl = databaseBuilder.factory.buildBrokenUrl({
        id: '2',
        errorMessage: 'Tout cassé',
        statusCode: 500,
        url: 'http://test.localhost:8080/',
      });
      notAllowedUrl = databaseBuilder.factory.buildBrokenUrl({
        id: '3',
        errorMessage: 'Pas le droit',
        statusCode: 401,
        url: 'http://www.test.org',
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
            },
            type: 'broken-urls',
          },
          {
            id: brokenUrl.id,
            attributes: {
              'error-message': brokenUrl.errorMessage,
              'status-code': brokenUrl.statusCode,
              url: brokenUrl.url,
            },
            type: 'broken-urls',
          },
          {
            id: notAllowedUrl.id,
            attributes: {
              'error-message': notAllowedUrl.errorMessage,
              'status-code': notAllowedUrl.statusCode,
              url: notAllowedUrl.url,
            },
            type: 'broken-urls',
          },
        ],
      });
    });
  });
});
