const { expect, databaseBuilder, generateAuthorizationHeader } = require('../../test-helper');
const createServer = require('../../../server');

describe('Acceptance | Controller | users-controller', () => {

  describe('GET /users/me - get authenticated user details', () => {

    it('should return authenticated user details', async () => {
      // Given
      const user = databaseBuilder.factory.buildUser({ name: 'User', trigram: 'ABC', access: 'admin', apiKey:'11b2cab8-050e-4165-8064-29a1e58d8997' });
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

