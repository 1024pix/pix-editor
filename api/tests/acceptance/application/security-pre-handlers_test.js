import { beforeEach, describe, expect, it } from 'vitest';
import { createServer } from '../../../server.js';
import { generateJwtAuthorizationHeader } from '../../test-helper.js';

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

  describe('#checkAppIsAuthenticatedViaJwt', () => {
    describe('when there is no authorization header', function() {
      it('should return a 401', async () => {
        // given
        const options = {
          method: 'GET',
          url: '/api/replication-stream',
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

    describe('when authorization header is malformated', function() {
      it('should return a 401', async () => {
        // given
        const options = {
          method: 'GET',
          url: '/api/replication-stream',
          headers: { authorization: 'Oursier jeton_d_acces' },
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

    describe('when access token is invalid', function() {
      it('should return a 401', async () => {
        // given
        const options = {
          method: 'GET',
          url: '/api/replication-stream',
          headers: { authorization: 'Bearer jeton_d_acces' },
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

    describe('when access token is valid', function() {
      it('should return a 200', async () => {
        // given
        const options = {
          method: 'GET',
          url: '/api/replication-stream',
          headers: generateJwtAuthorizationHeader(),
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
      });
    });
  });
});
