import { expect } from '../../../test-helper.js';
import {
  extractFromAirtableObject,
  hydrateReleaseObject,
  hydrateToAirtableObject,
  dehydrateAirtableObject
} from '../../../../lib/infrastructure/translations/competence.js';

describe('Unit | Infrastructure | Competence translations', () => {
  describe('#extractFromAirtableObject', () => {
    it('should return the list of translations', () => {
      // given
      const competence = {
        'id persistant': 'test',
        'Titre fr-fr': 'titre fr-fr',
        'Titre en-us': 'title en-us',
        'Description fr-fr': 'description en français',
        'Description en-us': 'english description',
      };

      // when
      const translations = extractFromAirtableObject(competence);

      // then
      expect(translations).to.deep.equal([
        { key: 'competence.test.name', locale: 'fr', value: 'titre fr-fr' },
        {
          key: 'competence.test.description',
          locale: 'fr',
          value: 'description en français',
        },
        { key: 'competence.test.name', locale: 'en', value: 'title en-us' },
        {
          key: 'competence.test.description',
          locale: 'en',
          value: 'english description',
        },
      ]);
    });

    it('should return translations only for field w/ values', () => {
      // given
      const competence = {
        'id persistant': 'test',
        'Titre fr-fr': 'titre fr-fr',
        'Titre en-us': 'titre en-us',
      };

      // when
      const translations = extractFromAirtableObject(competence);

      // then
      expect(translations).to.deep.equal([
        { key: 'competence.test.name', locale: 'fr', value: 'titre fr-fr' },
        { key: 'competence.test.name', locale: 'en', value: 'titre en-us' },
      ]);
    });
  });
  describe('#hydrateAirtableObject', () => {
    it('should set translated fields into the object', () => {
      // given
      const competence = {
        'id persistant': 'test',
        'Titre fr-fr': 'titre fr-fr initial',
        otherField: 'foo',
      };
      const translations = [
        { key: 'competence.test.name', locale: 'fr', value: 'titre fr-fr' },
        {
          key: 'competence.test.description',
          locale: 'fr',
          value: 'description en français',
        },
        { key: 'competence.test.name', locale: 'en', value: 'title en-us' },
        {
          key: 'competence.test.description',
          locale: 'en',
          value: 'english description',
        },
      ];

      // when
      hydrateToAirtableObject(competence, translations);

      // then
      expect(competence).to.deep.equal({
        'id persistant': 'test',
        'Titre fr-fr': 'titre fr-fr',
        'Titre en-us': 'title en-us',
        'Description fr-fr': 'description en français',
        'Description en-us': 'english description',
        otherField: 'foo',
      });
    });

    it('should set null value for missing translations', () => {
      // given
      const competence = {
        'id persistant': 'test',
        'Titre fr-fr': 'titre fr-fr initial',
      };
      const translations = [
        { key: 'competence.test.name', locale: 'en', value: 'title en-us' },
        {
          key: 'competence.test.description',
          locale: 'en',
          value: 'english description',
        },
      ];

      // when
      hydrateToAirtableObject(competence, translations);

      // then
      expect(competence).to.deep.equal({
        'id persistant': 'test',
        'Titre fr-fr': null,
        'Titre en-us': 'title en-us',
        'Description fr-fr': null,
        'Description en-us': 'english description',
      });
    });
  });

  describe('#dehydrateAirtableObject', () => {
    it('should set translated fields into the object', () => {
      // given
      const competence = {
        'id persistant': 'test',
        'Titre fr-fr': 'titre fr-fr initial',
        'Description fr-fr': 'description fr-fr initial',
        otherField: 'foo',
      };

      // when
      dehydrateAirtableObject(competence);

      // then
      expect(competence).to.deep.equal({
        'id persistant': 'test',
        otherField: 'foo',
      });
    });
  });

  describe('#hydrateReleaseObject', () => {
    it('should set translated fields into the object', () => {
      // given
      const competence = {
        id: 'test',
        otherField: 'foo',
      };
      const translations = [
        { key: 'competence.test.name', locale: 'fr', value: 'titre fr-fr' },
        {
          key: 'competence.test.description',
          locale: 'fr',
          value: 'description en français',
        },
        { key: 'competence.test.name', locale: 'en', value: 'title en-us' },
        {
          key: 'competence.test.description',
          locale: 'en',
          value: 'english description',
        },
      ];

      // when
      hydrateReleaseObject(competence, translations);

      // then
      expect(competence).to.deep.equal({
        id: 'test',
        name_i18n: {
          fr: 'titre fr-fr',
          en: 'title en-us',
        },
        description_i18n: {
          fr: 'description en français',
          en: 'english description',
        },
        otherField: 'foo',
      });
    });

    it('should set null value for missing translations', () => {
      // given
      const competence = {
        id: 'test',
        otherField: 'foo',
      };
      const translations = [
        { key: 'competence.test.name', locale: 'en', value: 'title en-us' },
        {
          key: 'competence.test.description',
          locale: 'en',
          value: 'english description',
        },
      ];

      // when
      hydrateReleaseObject(competence, translations);

      // then
      expect(competence).to.deep.equal({
        id: 'test',
        name_i18n: {
          fr: null,
          en: 'title en-us',
        },
        description_i18n: {
          fr: null,
          en: 'english description',
        },
        otherField: 'foo',
      });
    });
  });
});
