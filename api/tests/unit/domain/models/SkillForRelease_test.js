const { expect } = require('../../../test-helper');
const SkillForRelease = require('../../../../lib/domain/models/SkillForRelease');

describe('Unit | Domain | SkillForRelease', function() {
  describe('#constructor', function() {
    context('i18n', function() {
      it('should build special attribute hint_i18n correctly', function() {
        // given
        const inputArguments = {
          hintFrFr: 'hint fr',
          hintEnUs: 'hint en',
        };

        // when
        const skillForRelease = new SkillForRelease(inputArguments);

        // then
        expect(skillForRelease.hint_i18n).to.deep.equal({
          fr: 'hint fr',
          en: 'hint en',
        });
      });
    });
  });
});
