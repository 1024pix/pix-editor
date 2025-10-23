import { describe, expect, it } from 'vitest';
import { domainBuilder } from '../../../test-helper.js';

describe('Unit | Domain | Thematic', () => {
  describe('#prepareForCreation', () => {
    it('sets fields for creation', () => {
      // given
      const thematic = domainBuilder.buildThematic({
        index: null,
      });
      const competenceThematics = [domainBuilder.buildThematic(), domainBuilder.buildThematic()];

      // when
      thematic.prepareForCreation(competenceThematics);

      // then
      expect(thematic).toHaveProperty('index', 2);
    });
  });

  describe('#update', () => {
    it('sets fields for update', () => {
      // given
      const thematic = domainBuilder.buildThematic({
        airtableId: 'recThematic1',
        id: 'thematic1',
        name_i18n: {
          fr: 'avant',
          en: 'before',
        },
        index: 1,
        competenceAirtableId: 'recCompetence1',
        competenceId: 'competence1',
        tubeAirtableIds: ['recTube1', 'recTube2'],
        tubeIds: ['tube1', 'tube2'],
      });
      const thematicUpdates = domainBuilder.buildThematic({
        airtableId: 'recThematic1',
        id: 'thematic2',
        name_i18n: {
          fr: 'après',
          en: 'after',
        },
        index: 2,
        competenceAirtableId: 'recCompetence2',
        competenceId: 'competence2',
        tubeAirtableIds: ['recTube3', 'recTube4'],
        tubeIds: ['tube3', 'tube4'],
      });

      // when
      thematic.update(thematicUpdates);

      // then
      expect(thematic).toStrictEqual(
        domainBuilder.buildThematic({
          airtableId: 'recThematic1',
          id: 'thematic1',
          name_i18n: {
            fr: 'après',
            en: 'after',
          },
          index: 2,
          competenceAirtableId: 'recCompetence1',
          competenceId: 'competence1',
          tubeAirtableIds: ['recTube1', 'recTube2'],
          tubeIds: ['tube1', 'tube2'],
        }),
      );
    });
  });
});
