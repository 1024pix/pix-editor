const { expect } = require('../../../test-helper');
const AreaForRelease = require('../../../../lib/domain/models/AreaForRelease');

describe('Unit | Domain | AreaForRelease', () => {
  describe('constructor', () => {
    it('should return domain object AreaForRelease', function() {
      // when
      const area = new AreaForRelease();

      // then
      expect(area).to.be.instanceOf(AreaForRelease);
    });

    it('should return domain object AreaForRelease with common fields ', function() {
      const areaData  = {
        id : 'rec1',
        code: 1,
        competenceIds: ['comp1','comp2'],
        name:'Name1',
        competenceAirtableIds: ['compAir1','CompAir2'],
        color: 'emerald',
        frameworkId: 'pix',
      };

      // when
      const area = new AreaForRelease(areaData);

      // then
      expect(area).to.deep.contains(areaData);
    });

    it('should return domain object AreaForRelease without locale ', function() {
      const areaData  = {
        titleFrFr: 'Domaine',
        titleEnUs: 'AreaForRelease',
      };

      // when
      const area = new AreaForRelease(areaData,null);

      // then
      expect(area).to.deep.contains(areaData);
    });

    it('should return french title fields when there is "fr-fr" locale', function() {
      const areaData  = {
        titleFrFr: 'Domaine',
      };

      const expectedAreaForRelease  = {
        titleFrFr: 'Domaine',
        title: 'Domaine',
      };

      // when
      const area = new AreaForRelease(areaData, 'fr-fr');

      // then
      expect(area).to.deep.contains(expectedAreaForRelease);
    });

    it('should return french title fields when there is "fr" locale', function() {
      const areaData  = {
        titleFrFr: 'Domaine',
      };

      const expectedAreaForRelease  = {
        titleFrFr: 'Domaine',
        title: 'Domaine',
      };

      // when
      const area = new AreaForRelease(areaData, 'fr');

      // then
      expect(area).to.deep.contains(expectedAreaForRelease);
    });

    it('should return english title fields when there is "en" locale', function() {
      const areaData  = {
        titleEnUs: 'AreaForRelease',
      };

      const expectedAreaForRelease  = {
        titleEnUs: 'AreaForRelease',
        title: 'AreaForRelease',
      };

      // when
      const area = new AreaForRelease(areaData, 'en');

      // then
      expect(area).to.deep.contains(expectedAreaForRelease);
    });
  });
});
