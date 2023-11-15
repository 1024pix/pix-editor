import { describe, expect, it } from 'vitest';
import {
  extractFromAirtableObject,
  hydrateToAirtableObject,
  prefixFor,
} from '../../../../lib/infrastructure/translations/skill.js';

describe('Unit | Infrastructure | Skill translations', () => {
  describe('#extractFromAirtableObject', () => {
    it('should return the list of translations', () => {
      // given
      const skill = {
        'id persistant': 'test',
        'Indice fr-fr': 'indice fr-fr',
        'Indice en-us': 'hint en-us',
      };

      // when
      const translations = extractFromAirtableObject(skill);

      // then
      expect(translations).to.deep.equal([
        {
          key: 'skill.test.hint',
          locale: 'fr',
          value: 'indice fr-fr',
        },
        {
          key: 'skill.test.hint',
          locale: 'en',
          value: 'hint en-us',
        },
      ]);
    });

    it('should return translations only for field w/ values', () => {
      // given
      const skill = {
        'id persistant': 'test',
        'Indice fr-fr': 'indice fr-fr',
      };

      // when
      const translations = extractFromAirtableObject(skill);

      // then
      expect(translations).to.deep.equal([
        {
          key: 'skill.test.hint',
          locale: 'fr',
          value: 'indice fr-fr',
        }]);
    });
  });
  describe('#hydrateAirtableObject', () => {
    it('should set translated fields into the object', () => {
      // given
      const skill = {
        'id persistant': 'test',
        'Indice fr-fr': 'indice fr-fr initial',
        otherField: 'foo',
      };

      const translations = [
        { key: 'skill.test.hint', locale: 'fr', value: 'indice fr-fr' },
        { key: 'skill.test.hint', locale: 'en', value: 'indice en-us' },

      ];

      // when
      hydrateToAirtableObject(skill, translations);

      // then
      expect(skill).to.deep.equal({
        'id persistant': 'test',
        'Indice fr-fr': 'indice fr-fr',
        'Indice en-us': 'indice en-us',
        otherField: 'foo',
      });
    });

    it('should set null value for missing translations', () => {
      // given
      const skill = {
        'id persistant': 'test',
        'Indice fr-fr': 'indice fr-fr initial',
      };
      const translations = [
        { key: 'skill.test.hint', locale: 'fr', value: 'indice fr-fr' },
      ];

      // when
      hydrateToAirtableObject(skill, translations);

      // then
      expect(skill).to.deep.equal({
        'id persistant': 'test',
        'Indice fr-fr': 'indice fr-fr',
        'Indice en-us': null,
      });
    });
  });

  describe('#prefixFor', () => {
    it('should return the prefix for skill fields keys', () => {
      // given
      const skill = {
        'id persistant': 'recSkill123',
      };

      // when
      const prefix = prefixFor(skill);

      // then
      expect(prefix).toBe('skill.recSkill123.');
    });
  });
});
