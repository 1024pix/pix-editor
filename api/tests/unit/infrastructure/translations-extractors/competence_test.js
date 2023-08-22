const { expect } = require('../../../test-helper');
const { extractTranslations } = require('../../../../lib/infrastructure/translations-extractors/competence');

describe('Unit | Infrastructure | Translations Extractors | Competence', () => {
  describe('#extractTranslations', () => {

    it('should return the list of translations', () => {
      const translations = extractTranslations({
        'id persistant': 'test',
        'Titre fr-fr': 'titre fr-fr',
        'Titre en-us': 'title en-us',
        'Description fr-fr': 'description en français',
        'Description en-us': 'english description',
      });
      expect(translations).to.deep.equal([
        { key: 'competence.test.title', locale: 'fr', value: 'titre fr-fr' },
        { key: 'competence.test.description', locale: 'fr', value: 'description en français' },
        { key: 'competence.test.title', locale: 'en', value: 'title en-us' },
        { key: 'competence.test.description', locale: 'en', value: 'english description' },
      ]);
    });

    it('should return translations only for field w/ values', () => {
      const translations = extractTranslations({
        'id persistant': 'test',
        'Titre fr-fr': 'titre fr-fr'
      });
      expect(translations).to.deep.equal([
        { key: 'competence.test.title', locale: 'fr', value: 'titre fr-fr' },
      ]);
    });
  });
});
