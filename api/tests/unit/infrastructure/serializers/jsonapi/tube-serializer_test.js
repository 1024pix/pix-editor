import { describe, expect, it } from 'vitest';
import { domainBuilder } from '../../../../test-helper.js';
import { serialize } from '../../../../../lib/infrastructure/serializers/jsonapi/tube-serializer.js';

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
});
