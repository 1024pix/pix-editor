import {  describe, expect, it } from 'vitest';
import { domainBuilder } from '../../../test-helper.js';

describe('Unit | Domain | Tube', () => {
  describe('#get isWorkbench', () => {
    it('is true when name is @workbench', () => {
      // given
      const tube  = domainBuilder.buildTube({
        name: '@workbench',
      });

      // when
      const { isWorkbench } = tube;

      // then
      expect(isWorkbench).toBe(true);
    });

    it('is false when name os @workbench', () => {
      // given
      const tube  = domainBuilder.buildTube({
        name: '@test',
      });

      // when
      const { isWorkbench } = tube;

      // then
      expect(isWorkbench).toBe(false);
    });
  });

  describe('#prepareForCreation', () => {
    it('computes fields for creation', () => {

      // given
      const tube = domainBuilder.buildTube({
        thematicAirtableId: 'recThematic1',
        competenceAirtableId: null,
        index: null,
      });
      const thematic = domainBuilder.buildThematic({
        id: 'recThematic1',
        competenceAirtableId: 'recCompetence1',
        tubeAirtableIds: ['recTube1', 'recTube2'],
      });

      // when
      tube.prepareForCreation(thematic);

      // then
      expect(tube).toHaveProperty('competenceAirtableId', 'recCompetence1');
      expect(tube).toHaveProperty('index', 2);
    });
  });

  describe('#update', () => {
    it('updates fields', () => {
      // given
      const tube = domainBuilder.buildTube({
        name: '@test',
        index: 1,
        practicalTitle_i18n: {
          fr: 'Titre avant',
          en: 'Title before',
        },
        practicalDescription_i18n: {
          fr: 'Description avant',
          en: 'Description before',
        },
      });
      const tubeUpdates = domainBuilder.buildTube({
        name: '@pouet',
        index: 2,
        practicalTitle_i18n: {
          fr: 'Titre après',
          en: 'Title after',
        },
        practicalDescription_i18n: {
          fr: 'Description après',
          en: 'Description after',
        },
      });

      // when
      tube.update(tubeUpdates);

      // then
      expect(tube).toHaveProperty('name', '@pouet');
      expect(tube).toHaveProperty('index', 2);
      expect(tube).toHaveProperty('practicalTitle_i18n.fr', 'Titre après');
      expect(tube).toHaveProperty('practicalTitle_i18n.en', 'Title after');
      expect(tube).toHaveProperty('practicalDescription_i18n.fr', 'Description après');
      expect(tube).toHaveProperty('practicalDescription_i18n.en', 'Description after');
    });
  });
});
