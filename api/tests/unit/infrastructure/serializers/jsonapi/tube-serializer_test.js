import { describe, expect, it } from 'vitest';
import { domainBuilder } from '../../../../test-helper.js';
import { deserialize, serialize } from '../../../../../lib/infrastructure/serializers/jsonapi/tube-serializer.js';
import { Tube } from '../../../../../lib/domain/models/Tube.js';

describe('Unit | Serializer | JSONAPI | tube-serializer', () => {
  describe('#serialize', () => {
    it('serializes a tube', () => {
      // given
      const tube = domainBuilder.buildTube();

      // when
      const serializedThematic = serialize(tube);

      // then
      expect(serializedThematic).toStrictEqual({
        data: {
          type: 'tubes',
          id: tube.airtableId,
          attributes: {
            'pix-id': tube.id,
            name: tube.name,
            'practical-title-fr': tube.practicalTitle_i18n.fr,
            'practical-title-en': tube.practicalTitle_i18n.en,
            'practical-description-fr': tube.practicalDescription_i18n.fr,
            'practical-description-en': tube.practicalDescription_i18n.en,
            index: tube.index
          },
          relationships: {
            'competence': {
              data: {
                type: 'competences',
                id: tube.competenceAirtableId,
              },
            },
            'theme': {
              data: {
                type: 'themes',
                id: tube.thematicAirtableId,
              },
            },
            'raw-skills': {
              data: [
                {
                  type: 'skills',
                  id: tube.skillAirtableIds[0],
                },
                {
                  type: 'skills',
                  id: tube.skillAirtableIds[1],
                },
              ]
            },
          },
        },
      });
    });
  });

  describe('#deserialize', () => {
    it('deserializes a tube', async () => {
      // given
      const id = 'recTube1';
      const attributes = {
        'name': '@test',
        'practical-title-fr': 'Titre',
        'practical-title-en': 'Title',
        'practical-description-fr': 'La description',
        'practical-description-en': 'The description',
      };
      const relationships = {
        theme: {
          data: {
            type: 'themes',
            id: 'recThematic1',
          },
        },
      };
      const payload = {
        data: {
          type: 'tubes',
          id,
          attributes,
          relationships,
        },
      };

      // when
      const deserializedThematic = await deserialize(payload);

      // then
      expect(deserializedThematic).toStrictEqual(new Tube({
        airtableId: id,
        name: attributes.name,
        practicalTitle_i18n: {
          fr: attributes['practical-title-fr'],
          en: attributes['practical-title-en'],
        },
        practicalDescription_i18n: {
          fr: attributes['practical-description-fr'],
          en: attributes['practical-description-en'],
        },
        thematicAirtableId: relationships.theme.data.id,
      }));
    });
  });
});
