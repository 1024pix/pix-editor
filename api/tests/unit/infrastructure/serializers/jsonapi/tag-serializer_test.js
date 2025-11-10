import { describe, expect, it } from 'vitest';
import { deserialize, serialize } from '../../../../../lib/infrastructure/serializers/jsonapi/tag-serializer.js';
import { Tag } from '../../../../../lib/domain/models/index.js';

describe('Unit | Serializer | JSONAPI | tag-serializer', () => {
  describe('#serialize', () => {
    it('serializes a tag', () => {
      // given
      const tag = new Tag({
        id: 'recTag1',
        airtableId: 'recAirtable1',
        title: 'Internet',
      });

      // when
      const serializedTag = serialize(tag);

      // then
      expect(serializedTag).toStrictEqual({
        data: {
          type: 'tags',
          id: 'recAirtable1',
          attributes: {
            title: 'Internet',
            'pix-id': 'recTag1',
          },
        },
      });
    });
  });

  describe('#deserialize', () => {
    it('deserializes a tag', async () => {
      // given
      const id = 'recAirtableTag1';
      const attributes = { title: 'Internet' };
      const payload = {
        data: {
          type: 'tags',
          id,
          attributes,
        },
      };

      // when
      const deserializedTag = await deserialize(payload);

      // then
      expect(deserializedTag).toStrictEqual(
        new Tag({
          id: null,
          airtableId: 'recAirtableTag1',
          title: 'Internet',
        }),
      );
    });
  });
});
