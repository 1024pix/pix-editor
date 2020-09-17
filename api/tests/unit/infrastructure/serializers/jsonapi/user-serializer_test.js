const { expect } = require('../../../../test-helper');
const User = require('../../../../../lib/domain/models/User');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/user-serializer');

describe('Unit | Serializer | JSONAPI | user-serializer', () => {
  describe('#serialize', () => {
    it('should serialize a User', () => {
      // Given
      const user = new User({ id: 100, name: 'User', trigram: 'ABC', access: 'admin', apiKey:'11b2cab8-050e-4165-8064-29a1e58d8997' });
      const expectedSerializedUser = {
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

      // When
      const json = serializer.serialize(user);

      // Then
      expect(json).to.deep.equal(expectedSerializedUser);
    });
  });
});
