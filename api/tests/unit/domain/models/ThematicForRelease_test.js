const { expect } = require('../../../test-helper');
const ThematicForRelease = require('../../../../lib/domain/models/ThematicForRelease');

describe('Unit | Domain | ThematicForRelease', function() {
  describe('#constructor', function() {
    context('i18n', function() {
      it('should build special attribute name_i18n correctly', function() {
        // given
        const inputArguments = {
          name: 'name default',
          nameEnUs: 'name en',
        };

        // when
        const thematicForRelease = new ThematicForRelease(inputArguments);

        // then
        expect(thematicForRelease.name_i18n).to.deep.equal({
          fr: 'name default',
          en: 'name en',
        });
      });
    });
  });
});
