const { expect, sinon, hFake } = require('../../test-helper');
const securityPreHandlers = require('../../../lib/application/security-pre-handlers');
const userRepository = require('../../../lib/infrastructure/repositories/user-repository');
const User = require('../../../lib/domain/models/User');
const { UserNotFoundError } = require('../../../lib/domain/errors');

describe('Unit | Application | SecurityPreHandlers', () => {

  describe('#checkUserIsAuthenticated', () => {

    context('Successful case', () => {

      it('should allow access to resource - with "credentials" property filled with authenticated user - when the request contains the authorization header with a valid api key', async () => {
      // given
        const apiKey = 'valid.api.key';
        const authorizationHeader = `Bearer ${apiKey}`;
        const request = { headers: { authorization: authorizationHeader } };
        const authenticatedUser = new User({
          id: '1',
          name: 'AuthenticatedUser',
          trigram: 'ABC',
          apiKey,
          access: 'admin',
        });
        sinon.stub(userRepository, 'findByApiKey').withArgs(apiKey).resolves(authenticatedUser);

        // when
        const response = await securityPreHandlers.checkUserIsAuthenticated(request, hFake);

        // then
        expect(response.authenticated).to.deep.equal({ credentials: { user: authenticatedUser } });
      });

    });

    context('Error cases', () => {

      it('should disallow access to resource when api key is missing', async () => {
        // given
        const request = { headers: { } };
        // when
        const response = await securityPreHandlers.checkUserIsAuthenticated(request, hFake);

        // then
        expect(response.statusCode).to.equal(401);
        expect(response.isTakeOver).to.be.true;
      });

      it('should disallow access to resource when api key is wrong', async () => {
      // given
        const apiKey = 'wrong.api.key';
        const authorizationHeader = `Bearer ${apiKey}`;
        const request = { headers: { authorization: authorizationHeader } };
      
        sinon.stub(userRepository, 'findByApiKey').withArgs(apiKey).rejects(new UserNotFoundError());

        // when
        const response = await securityPreHandlers.checkUserIsAuthenticated(request, hFake);
      
        // then
        expect(response.statusCode).to.equal(401);
        expect(response.isTakeOver).to.be.true;
      });
    });
  });
});
