const { expect, domainBuilder } = require('../../../test-helper');
const Content = require('../../../../lib/domain/models/Content');
const Challenge = require('../../../../lib/domain/models/Challenge');
const Course = require('../../../../lib/domain/models/Course');
const Tube = require('../../../../lib/domain/models/Tube');
const Tutorial = require('../../../../lib/domain/models/Tutorial');

describe('Unit | Domain | Content', () => {
  describe('#from', () => {
    let data;
    beforeEach(function() {
      const areaAirtable = domainBuilder.buildAreaAirtableDataObject({
        id: 'recAreaA',
        code: 'codeAreaA',
        name: 'nameAreaA',
        color: 'colorAreaA',
        titleFrFr: 'Information et données',
        titleEnUs: 'Information and data',
        competenceIds: ['recCompA', 'recCompB'],
        competenceAirtableIds: ['recAirCompA', 'recAirCompB'],
        frameworkId: 'recFrameworkA',
      });
      const competenceAirtable = domainBuilder.buildCompetenceAirtableDataObject({
        id: 'recCompetenceA',
        name: 'nameCompetenceA',
        nameFrFr: 'nameFrCompetenceA',
        nameEnUs: 'nameEnCompetenceA',
        index: '1.2',
        areaId: 'recAreaA',
        origin: 'Pix',
        skillIds: [],
        thematicIds: [],
        description: 'descriptionCompetenceA',
        descriptionFrFr: 'descriptionFrCompetenceA',
        descriptionEnUs: 'descriptionEnCompetenceA',
        fullName: '1.2 nameCompetenceA',
      });
      const skillAirtable = domainBuilder.buildSkillAirtableDataObject({
        id: 'recSkillA',
        name: 'nameSkillA',
        hintFrFr: 'hintFr',
        hintEnUs: 'hintEn',
        hintStatus: 'hintStatusA',
        tutorialIds: ['tutorialId1'],
        learningMoreTutorialIds: ['learningMoreTutorialId1', 'learningMoreTutorialId2'],
        competenceId: 'competenceId1',
        pixValue: 1.8,
        status: 'actif',
        tubeId: 'tubeIdB',
        description: 'skill description A',
        level: 2,
        internationalisation: 'Monde',
        version: 2,
      });
      data = {
        areas: [areaAirtable],
        competences: [competenceAirtable],
        challenges: [{ id: 123 }],
        courses: [{ id: 123 }],
        skills: [skillAirtable],
        tubes: [{ id: 123, practicalTitleFrFr: 'titre pratique', practicalTitleEnUs: 'practical title', practicalDescriptionFrFr: 'description pratique', practicalDescriptionEnUs: 'practical description' }],
        tutorials: [{ id: 123 }],
      };
    });

    it('should return a Content model', function() {
      const content = Content.from({});

      expect(content).to.be.instanceOf(Content);
    });

    it('should return a Content model with models as attributes', function() {
      const content = Content.from(data);

      const expectedArea = domainBuilder.buildArea({
        id: 'recAreaA',
        code: 'codeAreaA',
        name: 'nameAreaA',
        color: 'colorAreaA',
        titleFrFr: 'Information et données',
        titleEnUs: 'Information and data',
        competenceIds: ['recCompA', 'recCompB'],
        competenceAirtableIds: ['recAirCompA', 'recAirCompB'],
        frameworkId: 'recFrameworkA',
      });
      const expectedCompetence = domainBuilder.buildCompetence({
        id: 'recCompetenceA',
        name: 'nameCompetenceA',
        nameFrFr: 'nameFrCompetenceA',
        nameEnUs: 'nameEnCompetenceA',
        index: '1.2',
        areaId: 'recAreaA',
        origin: 'Pix',
        skillIds: [],
        thematicIds: [],
        description: 'descriptionCompetenceA',
        descriptionFrFr: 'descriptionFrCompetenceA',
        descriptionEnUs: 'descriptionEnCompetenceA',
      });
      const expectedSkill = domainBuilder.buildSkill({
        id: 'recSkillA',
        name: 'nameSkillA',
        hintFrFr: 'hintFr',
        hintEnUs: 'hintEn',
        hintStatus: 'hintStatusA',
        tutorialIds: ['tutorialId1'],
        learningMoreTutorialIds: ['learningMoreTutorialId1', 'learningMoreTutorialId2'],
        competenceId: 'competenceId1',
        pixValue: 1.8,
        status: 'actif',
        tubeId: 'tubeIdB',
        description: 'skill description A',
        level: 2,
        internationalisation: 'Monde',
        version: 2,
      });

      expect(content.areas).to.deepEqualArray([expectedArea]);
      expect(content.competences).to.deepEqualArray([expectedCompetence]);
      expect(content.challenges[0]).to.be.instanceOf(Challenge);
      expect(content.courses[0]).to.be.instanceOf(Course);
      expect(content.skills).to.deepEqualArray([expectedSkill]);
      expect(content.tubes[0]).to.be.instanceOf(Tube);
      expect(content.tutorials[0]).to.be.instanceOf(Tutorial);
    });
  });
});
