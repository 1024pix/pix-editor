import { describe, expect, it } from 'vitest';
import { deserialize, serialize } from '../../../../../lib/infrastructure/serializers/jsonapi/tutorial-serializer.js';
import { Tutorial } from '../../../../../lib/domain/models/index.js';

describe('Unit | Serializer | JSONAPI | tutorial-serializer', () => {
  describe('#serialize', () => {
    it('serializes a tutorial', () => {
      // given
      const tutorial = new Tutorial({
        id: 'tutorialId',
        airtableId: 'tutorialAirtableId',
        title: 'mon titre',
        duration: '01:00:05',
        source: 'Mon grenier',
        format: Tutorial.FORMATS.AUDIO,
        link: 'https://www.somelink.com',
        license: Tutorial.LICENSES.CCBYSA,
        level: Tutorial.LEVELS.THREE,
        crush: Tutorial.CRUSHES.YES,
        language: 'fr',
        tagAirtableIds: ['tagAirtableId1', 'tagAirtableId2'],
      });

      // when
      const serializedTutorial = serialize(tutorial);

      // then
      expect(serializedTutorial).toStrictEqual({
        data: {
          type: 'tutorials',
          id: 'tutorialAirtableId',
          attributes: {
            title: 'mon titre',
            duration: '01:00:05',
            source: 'Mon grenier',
            format: Tutorial.FORMATS.AUDIO,
            link: 'https://www.somelink.com',
            license: Tutorial.LICENSES.CCBYSA,
            level: Tutorial.LEVELS.THREE,
            crush: Tutorial.CRUSHES.YES,
            language: 'fr',
            'pix-id': 'tutorialId'
          },
          relationships: {
            tags: {
              data: [
                {
                  type: 'tags',
                  id: 'tagAirtableId1',
                },
                {
                  type: 'tags',
                  id: 'tagAirtableId2',
                },
              ],
            },
          },
        },
      });
    });
  });

  describe('#deserialize', () => {
    it('deserializes a tutorial', async () => {
      // given
      const payload = {
        data: {
          type: 'tutorials',
          id: 'tutorialAirtableId',
          attributes: {
            title: 'mon titre',
            duration: '01:00:05',
            source: 'Mon grenier',
            format: Tutorial.FORMATS.AUDIO,
            link: 'https://www.somelink.com',
            license: Tutorial.LICENSES.CCBYSA,
            level: Tutorial.LEVELS.THREE,
            crush: Tutorial.CRUSHES.YES,
            language: 'fr',
            'pix-id': 'tutorialId'
          },
          relationships: {
            tags: {
              data: [
                {
                  type: 'tags',
                  id: 'tagAirtableId1',
                },
                {
                  type: 'tags',
                  id: 'tagAirtableId2',
                },
              ],
            },
          },
        },
      };

      // when
      const deserializedTutorial = await deserialize(payload);

      // then
      expect(deserializedTutorial).toStrictEqual(new Tutorial({
        id: 'tutorialId',
        airtableId: 'tutorialAirtableId',
        title: 'mon titre',
        duration: '01:00:05',
        source: 'Mon grenier',
        format: Tutorial.FORMATS.AUDIO,
        link: 'https://www.somelink.com',
        license: Tutorial.LICENSES.CCBYSA,
        level: Tutorial.LEVELS.THREE,
        crush: Tutorial.CRUSHES.YES,
        language: 'fr',
        tagAirtableIds: ['tagAirtableId1', 'tagAirtableId2'],
      }));
    });
  });
});
