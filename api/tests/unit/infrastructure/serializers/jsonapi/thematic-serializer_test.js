import { describe, expect, it } from 'vitest';
import { domainBuilder } from '../../../../test-helper.js';
import { serialize } from '../../../../../lib/infrastructure/serializers/jsonapi/thematic-serializer.js';

describe('Unit | Serializer | JSONAPI | thematic-serializer', () => {
  describe('#serialize', () => {
    it('should serialize a thematic', () => {
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
});
