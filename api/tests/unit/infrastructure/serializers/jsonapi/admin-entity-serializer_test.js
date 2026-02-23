import { describe, expect, it } from 'vitest';
import { deserialize, serialize } from '../../../../../lib/infrastructure/serializers/jsonapi/admin-entity-serializer.js';

describe('Unit | Serializer | JSONAPI | admin-entity-serializer', () => {
  describe('#serialize', () => {
    it('serializes an admin entity', () => {
      // given
      const tagEntity = {
        id: 'recTag1',
        title: 'Internet',
      };
      const entityName = 'tags';

      // when
      const serializedTag = serialize(entityName, tagEntity);

      // then
      expect(serializedTag).toStrictEqual({
        data: {
          type: 'admin-entities',
          id: 'tags:recTag1',
          attributes: {
            properties: {
              id: 'recTag1',
              title: 'Internet',
            },
          },
        },
      });
    });
  });

  describe('#deserialize', () => {
    it('deserializes an admin entity', async () => {
      // given
      const payload = {
        data: {
          type: 'admin-entities',
          attributes: { properties: { title: 'Internet' } },
        },
      };

      // when
      const deserializedTag = await deserialize(payload);

      // then
      expect(deserializedTag).toStrictEqual(
        { title: 'Internet' },
      );
    });
  });
});
