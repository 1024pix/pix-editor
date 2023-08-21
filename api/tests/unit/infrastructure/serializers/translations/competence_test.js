const { expect } = require('../../../../test-helper');
const { serialize } = require('../../../../../lib/infrastructure/serializers/translations/competence');

describe('Unit | Infrastructure | Serializers | Translations | Competence', () => {
  describe('#serialize', () => {

    it('should return the list of translated fields', () => {
      const translations = serialize({
        'id persistant': 'test',
        'Titre fr-fr': 'titre fr-fr',
        'Titre en-us': 'title en-us'
      });
      expect(translations).to.deep.equal([
        { key: 'competence.test.title', lang: 'fr', value: 'titre fr-fr' },
        { key: 'competence.test.title', lang: 'en', value: 'title en-us' }
      ]);
    });

    it('should return only the fields translated', () => {
      const translations = serialize({
        'id persistant': 'test',
        'Titre fr-fr': 'titre fr-fr'
      });
      expect(translations).to.deep.equal([
        { key: 'competence.test.title', lang: 'fr', value: 'titre fr-fr' },
      ]);
    });
  });
});
