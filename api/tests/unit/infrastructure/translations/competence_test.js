const { expect } = require('../../../test-helper');
const {
  extract,
  hydrate,
} = require('../../../../lib/infrastructure/translations/competence');

describe('Unit | Infrastructure | Competence translations', () => {
  describe('#extract', () => {
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
      const translations = extract(competence);

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
      };

      // when
      const translations = extract(competence);

      // then
      expect(translations).to.deep.equal([
        { key: 'competence.test.name', locale: 'fr', value: 'titre fr-fr' },
      ]);
    });
  });

  describe('#hydrate', () => {
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
      hydrate(competence, translations);

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
      hydrate(competence, translations);

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
});
