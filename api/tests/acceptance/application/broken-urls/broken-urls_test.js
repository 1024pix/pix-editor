import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { databaseBuilder, generateAuthorizationHeader } from '../../../test-helper.js';
import { createServer } from '../../../../server.js';

describe('Acceptance | Controller | broken-urls', () => {
  let now;
  beforeEach(function() {
    now = new Date('2024-10-29T03:04:00Z');
    vi.useFakeTimers({
      now,
      toFake: ['Date'],
    });
  });

  afterEach(function() {
    vi.useRealTimers();
  });

  describe('GET /broken-urls', () => {
    let editorUser, server;

    beforeEach(async function() {
      editorUser = databaseBuilder.factory.buildUser({ name: 'Madame Editor', access: 'editor' });
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

    it('should return the broken urls list', async () => {
      // when
      const response = await server.inject({
        method: 'GET',
        url: '/api/broken-urls',
        headers: generateAuthorizationHeader(editorUser),
      });

      // Then
      expect(response.statusCode).to.equal(200);
      // TODO return array with all information from url (where they are used, ...)
      expect(response.result).to.deep.equal({ data: [] });
    });
  });
});
