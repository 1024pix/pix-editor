const { expect } = require('../../../test-helper');
const TubeForRelease = require('../../../../lib/domain/models/TubeForRelease');

describe('Unit | Domain | TubeForRelease', function() {
  describe('constructor', function() {
    it('should return domain object TubeForRelease', function() {
      // when
      const tube = new TubeForRelease();

      // then
      expect(tube).to.be.instanceOf(TubeForRelease);
    });

    it('should return domain object TubeForRelease with common fields', function() {
      const tubeData = {
        id: 'rec1',
        name: 'tube1',
        title: 'titletube1',
        description: 'description',
        competenceId: 'reccomp1',
      };

      // when
      const tube = new TubeForRelease(tubeData);

      // then
      expect(tube).to.deep.contains(tubeData);
    });

    it('should return domain object TubeForRelease without locale', function() {
      // given
      const tubeData = {
        practicalTitleFrFr: 'title fr-fr 1',
        practicalTitleEnUs: 'title en-us 1',
        practicalDescriptionFrFr: 'desc fr-fr',
        practicalDescriptionEnUs: 'desc en-us',
      };

      // when
      const tube = new TubeForRelease(tubeData, null);

      // then
      expect(tube).to.deep.contains(tubeData);
    });

    it('should return french fields when there is "fr-fr" locale', function() {
      // given
      const tubeData = {
        practicalTitleFrFr: 'title fr-fr',
        practicalDescriptionFrFr: 'desc fr-fr',
      };

      const expectedTube = {
        practicalTitleFrFr: 'title fr-fr',
        practicalTitle: 'title fr-fr',
        practicalDescriptionFrFr: 'desc fr-fr',
        practicalDescription: 'desc fr-fr',
      };

      // when
      const tube = new TubeForRelease(tubeData, 'fr-fr');

      // then
      expect(tube).to.deep.contains(expectedTube);
    });

    it('should return french fields when there is "fr" locale', function() {
      // given
      const tubeData = {
        practicalTitleFrFr: 'title fr-fr',
        practicalDescriptionFrFr: 'desc fr-fr',
      };

      const expectedTube = {
        practicalTitleFrFr: 'title fr-fr',
        practicalTitle: 'title fr-fr',
        practicalDescriptionFrFr: 'desc fr-fr',
        practicalDescription: 'desc fr-fr',
      };

      // when
      const tube = new TubeForRelease(tubeData, 'fr');

      // then
      expect(tube).to.deep.contains(expectedTube);
    });

    it('should return english fields when there is "en" locale', function() {
      // given
      const tubeData = {
        practicalTitleEnUs: 'Name 1',
        practicalDescriptionEnUs: 'desc en',
      };

      const expectedTube = {
        practicalTitleEnUs: 'Name 1',
        practicalTitle: 'Name 1',
        practicalDescriptionEnUs: 'desc en',
        practicalDescription: 'desc en',
      };

      // when
      const tube = new TubeForRelease(tubeData, 'en');

      // then
      expect(tube).to.deep.contains(expectedTube);
    });
  });
});
