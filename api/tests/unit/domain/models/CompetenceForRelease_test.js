const { expect } = require('../../../test-helper');
const CompetenceForRelease = require('../../../../lib/domain/models/CompetenceForRelease');

describe('Unit | Domain | CompetenceForRelease', function() {
  describe('constructor', function() {
    it('should return domain object CompetenceForRelease', function() {
      // when
      const competence = new CompetenceForRelease();

      // then
      expect(competence).to.be.instanceOf(CompetenceForRelease);
    });

    it('should return domain object CompetenceForRelease with common fields', function() {
      const competenceData = {
        id: 'rec1',
        index: '1.1',
        areaId: 'recArea1',
        skillIds: ['skill1', 'skill2'],
        thematicIds: ['thematic1', 'thematic1'],
        origin: 'pix',
      };

      // when
      const competence = new CompetenceForRelease(competenceData);

      // then
      expect(competence).to.deep.contains(competenceData);
    });

    it('should return domain object CompetenceForRelease without locale ', function() {
      // given
      const competenceData = {
        name: 'Nom 1',
        nameFrFr: 'Nom fr-fr 1',
        nameEnUs: 'Name en-us 1',
        description: 'desc',
        descriptionFrFr: 'desc fr-fr',
        descriptionEnUs: 'desc en-us',
      };

      // when
      const competence = new CompetenceForRelease(competenceData, null);

      // then
      expect(competence).to.deep.contains(competenceData);
    });

    it('should return french fields when there is "fr-fr" locale', function() {
      // given
      const competenceData = {
        nameFrFr: 'Nom fr-fr 1',
        descriptionFrFr: 'desc fr-fr',
      };

      const expectedCompetenceForRelease = {
        nameFrFr: 'Nom fr-fr 1',
        name: 'Nom fr-fr 1',
        description: 'desc fr-fr',
        descriptionFrFr: 'desc fr-fr',
      };

      // when
      const competence = new CompetenceForRelease(competenceData, 'fr-fr');

      // then
      expect(competence).to.deep.contains(expectedCompetenceForRelease);
    });

    it('should return french fields when there is "fr" locale', function() {
      // given
      const competenceData = {
        nameFrFr: 'Nom fr-fr 1',
        descriptionFrFr: 'desc fr-fr',
      };

      const expectedCompetenceForRelease = {
        nameFrFr: 'Nom fr-fr 1',
        name: 'Nom fr-fr 1',
        description: 'desc fr-fr',
        descriptionFrFr: 'desc fr-fr',
      };

      // when
      const competence = new CompetenceForRelease(competenceData, 'fr');

      // then
      expect(competence).to.deep.contains(expectedCompetenceForRelease);
    });

    it('should return english fields when there is "en" locale', function() {
      // given
      const competenceData = {
        nameEnUs: 'Name 1',
        descriptionEnUs: 'desc en',
      };

      const expectedCompetenceForRelease = {
        nameEnUs: 'Name 1',
        name: 'Name 1',
        description: 'desc en',
        descriptionEnUs: 'desc en',
      };

      // when
      const competence = new CompetenceForRelease(competenceData, 'en');

      // then
      expect(competence).to.deep.contains(expectedCompetenceForRelease);
    });
  });
});
