const { expect } = require('../../../test-helper');
const CompetenceForRelease = require('../../../../lib/domain/models/CompetenceForRelease');

describe('Unit | Domain | CompetenceForRelease', function() {
  describe('#constructor', function() {
    context('i18n', function() {
      it('should build special attribute name_i18n correctly', function() {
        // given
        const inputArguments = {
          name: 'name default',
          nameFrFr: 'name fr',
          nameEnUs: 'name en',
        };

        // when
        const competenceForRelease = new CompetenceForRelease(inputArguments);

        // then
        expect(competenceForRelease.name_i18n).to.deep.equal({
          fr: 'name fr',
          en: 'name en',
        });
      });
      it('should build special attribute description_i18n correctly', function() {
        // given
        const inputArguments = {
          description: 'description default',
          descriptionFrFr: 'description fr',
          descriptionEnUs: 'description en',
        };

        // when
        const competenceForRelease = new CompetenceForRelease(inputArguments);

        // then
        expect(competenceForRelease.description_i18n).to.deep.equal({
          fr: 'description fr',
          en: 'description en',
        });
      });
    });
  });
});
