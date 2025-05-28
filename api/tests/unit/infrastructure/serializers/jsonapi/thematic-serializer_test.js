import { describe, expect, it } from 'vitest';
import { domainBuilder } from '../../../../test-helper.js';
import { serialize, deserialize } from '../../../../../lib/infrastructure/serializers/jsonapi/thematic-serializer.js';
import { Thematic } from '../../../../../lib/domain/models/Thematic.js';

describe('Unit | Serializer | JSONAPI | thematic-serializer', () => {
  describe('#serialize', () => {
    it('serializes a thematic', () => {
      // given
      const thematic = domainBuilder.buildThematic();

      // when
      const serializedThematic = serialize(thematic);

      // then
      expect(serializedThematic).toStrictEqual({
        data: {
          type: 'themes',
          id: thematic.airtableId,
          attributes: {
            'pix-id': thematic.id,
            name: thematic.name_i18n.fr,
            'name-en-us': thematic.name_i18n.en,
            index: thematic.index
          },
          relationships: {
            'competence': {
              data: {
                type: 'competences',
                id: thematic.competenceAirtableId,
              },
            },
            'raw-tubes': {
              data: [
                {
                  type: 'tubes',
                  id: thematic.tubeAirtableIds[0],
                },
              ]
            },
          },
        },
      });
    });
  });

  describe('#deserialize', () => {
    it('deserializes a thematic', async () => {
      // given
      const id = 'recThematic1';
      const attributes = {
        'name': 'Nom de la thématique',
        'name-en-us': 'Thematic’s name',
        'index': 2,
      };
      const relationships = {
        competence: {
          data: {
            type: 'competences',
            id: 'recCompetence1',
          },
        },
      };
      const payload = {
        data: {
          type: 'themes',
          id,
          attributes,
          relationships,
        },
      };

      // when
      const deserializedThematic = await deserialize(payload);

      // then
      expect(deserializedThematic).toStrictEqual(new Thematic({
        airtableId: id,
        name_i18n: {
          fr: attributes.name,
          en: attributes['name-en-us'],
        },
        index: 2,
        competenceAirtableId: relationships.competence.data.id,
      }));
    });
  });
});
