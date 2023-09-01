import { expect } from '../../test-helper.js';
import { createServer } from '../../../server.js';

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
        errors: [{
          code: 401,
          title: 'Unauthorized access',
          detail: 'Missing or invalid access token in request auhorization headers.'
        }]
      };
      expect(response.statusCode).to.equal(401);
      expect(response.result).to.deep.equal(jsonApiError);
    });
  });
});
