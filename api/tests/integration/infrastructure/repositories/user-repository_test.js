const { expect, databaseBuilder } = require('../../../test-helper');
const userRepository = require('../../../../lib/infrastructure/repositories/user-repository');
const User = require('../../../../lib/domain/models/User');

describe('Integration | Repository | user-repository', function() {
  describe('#findByApiKey', function() {

    it('should return User associated to given apiKey', async function() {
      // Given
      const apiKey = '11567d7c-b787-4ecb-ac44-800e11f64a66';
      const userToCreate = {
        apiKey,
        id: 1,
        name: 'Nom',
        trigram: 'ABC',
        access: 'readonly',
      };
      const expectedUser = new User(userToCreate);
      databaseBuilder.factory.buildUser(userToCreate);
      await databaseBuilder.commit();

      // When
      const user = await userRepository.findByApiKey(apiKey);

      // Then
      expect(user).to.be.an.instanceOf(User);
      expect(user.id).to.equal(expectedUser.id);
      expect(user.apiKey).to.equal(expectedUser.apiKey);
      expect(user.name).to.equal(expectedUser.name);
      expect(user.trigram).to.equal(expectedUser.trigram);
      expect(user.access).to.equal(expectedUser.access);
    });
  });

});

