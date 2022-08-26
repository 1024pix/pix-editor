const { expect } = require('../../../test-helper');
const ThematicForRelease = require('../../../../lib/domain/models/ThematicForRelease');

describe('Unit | Domain | ThematicForRelease', function() {
  describe('constructor', function() {
    it('should return domain object Thematic', function() {
      // when
      const thematic = new ThematicForRelease();

      // then
      expect(thematic).to.be.instanceOf(ThematicForRelease);
    });

    it('should return domain object Thematic with common fields', function() {
      const thematicData = {
        id: 'rec1',
        index: '1.1',
        competenceId: ['comp1', 'comp2'],
        tubeIds: ['tube1', 'tube1'],
      };

      // when
      const thematic = new ThematicForRelease(thematicData);

      // then
      expect(thematic).to.deep.contains(thematicData);
    });

    it('should return domain object Thematic without locale', function() {
      // given
      const thematicData = {
        name: 'Nom 1',
        nameEnUs: 'Name en-us 1',
      };

      // when
      const thematic = new ThematicForRelease(thematicData, null);

      // then
      expect(thematic).to.deep.contains(thematicData);
    });

    it('should return name field when locale is "fr-fr"', function() {
      const thematicData = {
        name: 'Nom',
      };

      // when
      const thematic = new ThematicForRelease(thematicData, 'fr-fr');

      // then
      expect(thematic).to.deep.contains(thematicData);
    });

    it('should return name field when locale is "fr"', function() {
      const thematicData = {
        name: 'Nom',
      };

      // when
      const thematic = new ThematicForRelease(thematicData, 'fr');

      // then
      expect(thematic).to.deep.contains(thematicData);
    });

    it('should return english name field when locale is "en"', function() {
      const thematicData = {
        nameEnUs: 'Name',
      };

      const expectedThematic = {
        name: 'Name',
        nameEnUs: 'Name',
      };

      // when
      const thematic = new ThematicForRelease(thematicData, 'en');

      // then
      expect(thematic).to.deep.contains(expectedThematic);
    });
  });
});
