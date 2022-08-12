const { expect } = require('../../../test-helper');
const Area = require('../../../../lib/domain/models/Area');

describe('Unit | Domain | Area', () => {
  describe('constructor', () => {
    it('should return domain object Area', function() {
      // when
      const area = new Area();

      // then
      expect(area).to.be.instanceOf(Area);
    });

    it('should return domain object Area with common fields ', function() {
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
      const area = new Area(areaData);

      // then
      expect(area).to.deep.contains(areaData);
    });

    it('should return domain object Area without locale ', function() {
      const areaData  = {
        titleFrFr: 'Domaine',
        titleEnUs: 'Area',
      };

      // when
      const area = new Area(areaData,null);

      // then
      expect(area).to.deep.contains(areaData);
    });

    it('should return french title fields when there is "fr-fr" locale', function() {
      const areaData  = {
        titleFrFr: 'Domaine',
      };

      const expectedArea  = {
        titleFrFr: 'Domaine',
        title: 'Domaine',
      };

      // when
      const area = new Area(areaData, 'fr-fr');

      // then
      expect(area).to.deep.contains(expectedArea);
    });

    it('should return french title fields when there is "fr" locale', function() {
      const areaData  = {
        titleFrFr: 'Domaine',
      };

      const expectedArea  = {
        titleFrFr: 'Domaine',
        title: 'Domaine',
      };

      // when
      const area = new Area(areaData, 'fr');

      // then
      expect(area).to.deep.contains(expectedArea);
    });

    it('should return english title fields when there is "en" locale', function() {
      const areaData  = {
        titleEnUs: 'Area',
      };

      const expectedArea  = {
        titleEnUs: 'Area',
        title: 'Area',
      };

      // when
      const area = new Area(areaData, 'en');

      // then
      expect(area).to.deep.contains(expectedArea);
    });
  });
});
