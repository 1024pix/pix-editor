import { expect, databaseBuilder, catchErr } from '../../../test-helper.js';
import { findByApiKey } from '../../../../lib/infrastructure/repositories/user-repository.js';
import { User } from '../../../../lib/domain/models/User.js';
import { UserNotFoundError } from '../../../../lib/domain/errors.js';

describe('Integration | Repository | user-repository', function() {
  describe('#findByApiKey', function() {

    it('should return user associated to given apiKey', async function() {
      // Given
      const apiKey = '00000000-0000-0000-0000-000000000000';
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
      const user = await findByApiKey(apiKey);

      // Then
      expect(user).to.be.an.instanceOf(User);
      expect(user.id).to.equal(expectedUser.id);
      expect(user.apiKey).to.equal(expectedUser.apiKey);
      expect(user.name).to.equal(expectedUser.name);
      expect(user.trigram).to.equal(expectedUser.trigram);
      expect(user.access).to.equal(expectedUser.access);
    });

    it('should throw an error when user is not found', async function() {
      // Given
      const apiKey = '00000000-0000-0000-0000-000000000000';

      // When
      const error = await catchErr(findByApiKey)(apiKey);

      // Then
      expect(error).to.be.instanceOf(UserNotFoundError);
    });
  });
});
