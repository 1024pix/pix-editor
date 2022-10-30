const { expect } = require('../../../test-helper');
const AreaForRelease = require('../../../../lib/domain/models/AreaForRelease');

describe('Unit | Domain | AreaForRelease', function() {
  describe('#constructor', function() {
    context('i18n', function() {
      it('should build special attribute title_i18n correctly', function() {
        // given
        const inputArguments = {
          titleFrFr: 'titre fr',
          titleEnUs: 'titre en',
        };

        // when
        const areaForRelease = new AreaForRelease(inputArguments);

        // then
        expect(areaForRelease.title_i18n).to.deep.equal({
          fr: 'titre fr',
          en: 'titre en',
        });
      });
    });
  });
});
