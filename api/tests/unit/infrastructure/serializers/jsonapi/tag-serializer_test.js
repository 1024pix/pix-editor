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
        notes: 'une note',
        description: 'une description',
        skillAirtableIds: ['skillAirtableId1', 'skillAirtableId2'],
        tutorialAirtableIds: ['tutorialAirtableId1', 'tutorialAirtableId2'],
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
            notes: 'une note',
            description: 'une description',
            'pix-id': 'recTag1',
          },
          relationships: {
            skills: {
              data: [
                {
                  type: 'skills',
                  id: 'skillAirtableId1',
                },
                {
                  type: 'skills',
                  id: 'skillAirtableId2',
                },
              ],
            },
            tutorials: {
              data: [
                {
                  type: 'tutorials',
                  id: 'tutorialAirtableId1',
                },
                {
                  type: 'tutorials',
                  id: 'tutorialAirtableId2',
                },
              ],
            },
          },
        },
      });
    });
  });

  describe('#deserialize', () => {
    it('deserializes a tag', async () => {
      // given
      const id = 'recAirtableTag1';
      const attributes = {
        'title': 'Internet',
        'notes': 'une note',
      };
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
      expect(deserializedTag).toStrictEqual(new Tag({
        id: null,
        airtableId: 'recAirtableTag1',
        title: 'Internet',
        notes: 'une note',
      }));
    });
  });
});
