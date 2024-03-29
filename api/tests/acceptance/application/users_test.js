import { describe, expect, it } from 'vitest';
import { databaseBuilder, generateAuthorizationHeader } from '../../test-helper.js';
import { createServer } from '../../../server.js';

describe('Acceptance | Controller | users-controller', () => {

  describe('GET /users/me - get authenticated user details', () => {

    it('should return authenticated user details', async () => {
      // Given
      const user = databaseBuilder.factory.buildAdminUser();
      await databaseBuilder.commit();
      const expectedAuthenticatedUser = {
        data: {
          type: 'users',
          id: `${user.id}`,
          attributes: {
            'name': user.name,
            'trigram': user.trigram,
            'access': user.access,
            'created-at': user.createdAt,
            'updated-at': user.updatedAt,
          },
        }
      };
      const server = await createServer();
      const getUsersMeOptions = {
        method: 'GET',
        url: '/api/users/me',
        headers: generateAuthorizationHeader(user)
      };

      // When
      const response = await server.inject(getUsersMeOptions);

      // Then
      expect(response.statusCode).to.equal(200);
      expect(response.result).to.deep.equal(expectedAuthenticatedUser);
    });

  });

});

