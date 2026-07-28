import { beforeEach, describe, expect, it } from 'vitest';
import { createServer } from '../../../server.js';
import { databaseBuilder } from '../../test-helper.js';

describe('Acceptance | Application | SecurityPreHandlers', () => {
  let server;
  let user;

  beforeEach(async () => {
    server = await createServer();
    user = await databaseBuilder.factory.buildAdminUser();
    await databaseBuilder.commit();
  });

  describe('#checkUserIsAuthenticatedViaHeader', () => {
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
    it('should allow access resource on valid header', async () => {
      // given
      const options = {
        method: 'GET',
        url: '/api/config',
        headers: { 'x-api-key': user.apiKey },
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
    });
  });
});
