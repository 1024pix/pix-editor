const { expect, sinon, hFake } = require('../../test-helper');
const securityPreHandlers = require('../../../lib/application/security-pre-handlers');
const userRepository = require('../../../lib/infrastructure/repositories/user-repository');
const User = require('../../../lib/domain/models/User');
const { UserNotFoundError } = require('../../../lib/domain/errors');

describe('Unit | Application | SecurityPreHandlers', () => {

  describe('#checkUserIsAuthenticatedViaBearer', () => {

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
        const response = await securityPreHandlers.checkUserIsAuthenticatedViaBearer(request, hFake);

        // then
        expect(response.authenticated).to.deep.equal({ credentials: { user: authenticatedUser } });
      });

    });

    context('Error cases', () => {

      it('should disallow access to resource when api key is missing', async () => {
        // given
        const request = { headers: { } };
        // when
        const response = await securityPreHandlers.checkUserIsAuthenticatedViaBearer(request, hFake);

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
        const response = await securityPreHandlers.checkUserIsAuthenticatedViaBearer(request, hFake);

        // then
        expect(response.statusCode).to.equal(401);
        expect(response.isTakeOver).to.be.true;
      });
    });
  });

  describe('#checkUserIsAuthenticatedViaBasicAndAdmin', () => {

    context('Successful case', () => {

      it('should allow access to resource - with "credentials" property filled with authenticated user - when the request contains the authorization header with a valid api key', async () => {
      // given
        const apiKey = 'valid.api.key';
        const authenticatedUser = new User({
          id: '1',
          name: 'AuthenticatedUser',
          trigram: 'ABC',
          apiKey,
          access: 'admin',
        });
        sinon.stub(userRepository, 'findByApiKey').withArgs(apiKey).resolves(authenticatedUser);

        // when
        const response = await securityPreHandlers.checkUserIsAuthenticatedViaBasicAndAdmin(apiKey);

        // then
        expect(response).to.deep.equal({ isValid: true, credentials: { user: authenticatedUser } });
      });

    });

    context('Error cases', () => {

      it('should disallow access to resource when the api key is not found', async () => {
        // given
        const apiKey = 'invalid.api.key';

        sinon.stub(userRepository, 'findByApiKey').withArgs(apiKey).rejects();

        // when
        const response = await securityPreHandlers.checkUserIsAuthenticatedViaBasicAndAdmin(apiKey);

        // then
        expect(response).to.be.deep.equal({ isValid: false });
      });

      it('should disallow access to resource when the user is not an admin', async () => {
        // given
        const apiKey = 'valid.api.key';
        const authenticatedUser = new User({
          id: '1',
          name: 'AuthenticatedUser',
          trigram: 'ABC',
          apiKey,
          access: 'readonly',
        });
        sinon.stub(userRepository, 'findByApiKey').withArgs(apiKey).resolves(authenticatedUser);

        // when
        const response = await securityPreHandlers.checkUserIsAuthenticatedViaBasicAndAdmin(apiKey);

        // then
        expect(response).to.deep.equal({ isValid: false });
      });
    });
  });
});
