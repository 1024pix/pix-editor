const { expect } = require('../../../test-helper');
const TubeForRelease = require('../../../../lib/domain/models/TubeForRelease');

describe('Unit | Domain | TubeForRelease', function() {
  describe('#constructor', function() {
    context('i18n', function() {
      it('should build special attribute practicalTitle_i18n correctly', function() {
        // given
        const inputArguments = {
          practicalTitleFrFr: 'practicalTitle fr',
          practicalTitleEnUs: 'practicalTitle en',
        };

        // when
        const tubeForRelease = new TubeForRelease(inputArguments);

        // then
        expect(tubeForRelease.practicalTitle_i18n).to.deep.equal({
          fr: 'practicalTitle fr',
          en: 'practicalTitle en',
        });
      });
      it('should build special attribute practicalDescription_i18n correctly', function() {
        // given
        const inputArguments = {
          practicalDescriptionFrFr: 'practicalDescription fr',
          practicalDescriptionEnUs: 'practicalDescription en',
        };

        // when
        const tubeForRelease = new TubeForRelease(inputArguments);

        // then
        expect(tubeForRelease.practicalDescription_i18n).to.deep.equal({
          fr: 'practicalDescription fr',
          en: 'practicalDescription en',
        });
      });
    });
  });
});
