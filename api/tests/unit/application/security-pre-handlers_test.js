import { describe, describe as context, expect, it, vi } from 'vitest';
import { hFake } from '../../test-helper.js';
import {
  checkUserHasAdminAccess,
  checkUserHasWriteAccess,
  checkUserIsAuthenticatedViaBasicAndAdmin,
  checkUserIsAuthenticatedViaBearer
} from '../../../lib/application/security-pre-handlers.js';
import { userRepository } from '../../../lib/infrastructure/repositories/index.js';
import { User } from '../../../lib/domain/models/User.js';
import { UserNotFoundError } from '../../../lib/domain/errors.js';

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
        vi.spyOn(userRepository, 'findByApiKey').mockImplementation(async (spyApiKey) => {
          if (spyApiKey === apiKey) return authenticatedUser;
        });

        // when
        const response = await checkUserIsAuthenticatedViaBearer(request, hFake);

        // then
        expect(response.authenticated).to.deep.equal({ credentials: { user: authenticatedUser } });
      });

    });

    context('Error cases', () => {

      it('should disallow access to resource when api key is missing', async () => {
        // given
        const request = { headers: { } };
        // when
        const response = await checkUserIsAuthenticatedViaBearer(request, hFake);

        // then
        expect(response.statusCode).to.equal(401);
        expect(response.isTakeOver).to.be.true;
      });

      it('should disallow access to resource when api key is wrong', async () => {
        // given
        const apiKey = 'wrong.api.key';
        const authorizationHeader = `Bearer ${apiKey}`;
        const request = { headers: { authorization: authorizationHeader } };

        vi.spyOn(userRepository, 'findByApiKey').mockImplementation(async (spyApiKey) => {
          if (spyApiKey === apiKey) throw new UserNotFoundError();
        });

        // when
        const response = await checkUserIsAuthenticatedViaBearer(request, hFake);

        // then
        expect(response.statusCode).to.equal(401);
        expect(response.isTakeOver).to.be.true;
      });
    });
  });

  describe('#checkUserIsAuthenticatedViaBasicAndAdmin', () => {

    context('Successful case', () => {

      it('should allow access to resource - returning apiKey as email - when the request contains the authorization header with a valid api key', async () => {
      // given
        const apiKey = 'valid.api.key';
        const authenticatedUser = new User({
          id: '1',
          name: 'AuthenticatedUser',
          trigram: 'ABC',
          apiKey,
          access: 'admin',
        });
        vi.spyOn(userRepository, 'findByApiKey').mockImplementation(async (spyApiKey) => {
          if (spyApiKey === apiKey) return authenticatedUser;
        });

        // when
        const response = await checkUserIsAuthenticatedViaBasicAndAdmin(apiKey);

        // then
        expect(response).to.deep.equal({ email: apiKey });
      });

    });

    context('Error cases', () => {

      it('should disallow access to resource when the api key is not found', async () => {
        // given
        const apiKey = 'invalid.api.key';

        vi.spyOn(userRepository, 'findByApiKey').mockImplementation(async (spyApiKey) => {
          if (spyApiKey === apiKey) throw new Error();
        });

        // when
        const response = await checkUserIsAuthenticatedViaBasicAndAdmin(apiKey);

        // then
        expect(response).to.be.false;
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
        vi.spyOn(userRepository, 'findByApiKey').mockImplementation(async (spyApiKey) => {
          if (spyApiKey === apiKey) return authenticatedUser;
        });

        // when
        const response = await checkUserIsAuthenticatedViaBasicAndAdmin(apiKey);

        // then
        expect(response).to.deep.equal(false);
      });
    });
  });

  describe('#checkUserHasWriteAccess', () => {
    it('returns nothing when the user is admin', async () => {
      // given
      const user = new User({
        id: '1',
        name: 'AuthenticatedUser',
        trigram: 'ABC',
        access: 'admin',
      });
      const request = { auth: { credentials: { user } } };

      // when
      const response = await checkUserHasWriteAccess(request, hFake);

      // then
      expect(response.source).to.equal(true);
    });

    it('returns nothing when the user is editor', async () => {
      // given
      const user = new User({
        id: '1',
        name: 'AuthenticatedUser',
        trigram: 'ABC',
        access: 'editor',
      });
      const request = { auth: { credentials: { user } } };

      // when
      const response = await checkUserHasWriteAccess(request, hFake);

      // then
      expect(response.source).to.equal(true);
    });

    it('returns nothing when the user is replicator', async () => {
      // given
      const user = new User({
        id: '1',
        name: 'AuthenticatedUser',
        trigram: 'ABC',
        access: 'replicator',
      });
      const request = { auth: { credentials: { user } } };

      // when
      const response = await checkUserHasWriteAccess(request, hFake);

      // then
      expect(response.source).to.equal(true);
    });

    it('returns an error when the user is readonly', async () => {
      // given
      const user = new User({
        id: '1',
        name: 'AuthenticatedUser',
        trigram: 'ABC',
        access: 'readonly',
      });
      const request = { auth: { credentials: { user } } };

      // when
      const response = await checkUserHasWriteAccess(request, hFake);

      // then
      expect(response.statusCode).to.equal(403);
      expect(response.isTakeOver).to.be.true;
    });

    it('returns an error when the user is pix-readonly', async () => {
      // given
      const user = new User({
        id: '1',
        name: 'AuthenticatedUser',
        trigram: 'ABC',
        access: 'readpixonly',
      });
      const request = { auth: { credentials: { user } } };

      // when
      const response = await checkUserHasWriteAccess(request, hFake);

      // then
      expect(response.statusCode).to.equal(403);
      expect(response.isTakeOver).to.be.true;
    });
  });

  describe('#checkUserHasAdminAccess', () => {
    it('returns nothing when the user is admin', async () => {
      // given
      const user = new User({
        id: '1',
        name: 'AuthenticatedUser',
        trigram: 'ABC',
        access: 'admin',
      });
      const request = { auth: { credentials: { user } } };

      // when
      const response = await checkUserHasAdminAccess(request, hFake);

      // then
      expect(response.source).to.equal(true);
    });

    it('returns an error when the user is editor', async () => {
      // given
      const user = new User({
        id: '1',
        name: 'AuthenticatedUser',
        trigram: 'ABC',
        access: 'editor',
      });
      const request = { auth: { credentials: { user } } };

      // when
      const response = await checkUserHasAdminAccess(request, hFake);

      // then
      expect(response.statusCode).to.equal(403);
      expect(response.isTakeOver).to.be.true;
    });

    it('returns an error when the user is replicator', async () => {
      // given
      const user = new User({
        id: '1',
        name: 'AuthenticatedUser',
        trigram: 'ABC',
        access: 'replicator',
      });
      const request = { auth: { credentials: { user } } };

      // when
      const response = await checkUserHasAdminAccess(request, hFake);

      // then
      expect(response.statusCode).to.equal(403);
      expect(response.isTakeOver).to.be.true;
    });

    it('returns an error when the user is readonly', async () => {
      // given
      const user = new User({
        id: '1',
        name: 'AuthenticatedUser',
        trigram: 'ABC',
        access: 'readonly',
      });
      const request = { auth: { credentials: { user } } };

      // when
      const response = await checkUserHasAdminAccess(request, hFake);

      // then
      expect(response.statusCode).to.equal(403);
      expect(response.isTakeOver).to.be.true;
    });

    it('returns an error when the user is pix-readonly', async () => {
      // given
      const user = new User({
        id: '1',
        name: 'AuthenticatedUser',
        trigram: 'ABC',
        access: 'readpixonly',
      });
      const request = { auth: { credentials: { user } } };

      // when
      const response = await checkUserHasAdminAccess(request, hFake);

      // then
      expect(response.statusCode).to.equal(403);
      expect(response.isTakeOver).to.be.true;
    });
  });

});
