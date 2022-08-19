const { expect, domainBuilder } = require('../../../test-helper');
const Content = require('../../../../lib/domain/models/Content');
const Challenge = require('../../../../lib/domain/models/Challenge');
const Course = require('../../../../lib/domain/models/Course');
const Tube = require('../../../../lib/domain/models/Tube');
const Tutorial = require('../../../../lib/domain/models/Tutorial');
const Training = require('../../../../lib/domain/models/Training');

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
        trainings: [{ id: 345 }],
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
        locale: null,
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
        locale: null,
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
        locale: null
      });

      expect(content.areas).to.deep.equal([expectedArea]);
      expect(content.competences).to.deep.equal([expectedCompetence]);
      expect(content.challenges[0]).to.be.instanceOf(Challenge);
      expect(content.courses[0]).to.be.instanceOf(Course);
      expect(content.skills).to.deep.equal([expectedSkill]);
      expect(content.tubes[0]).to.be.instanceOf(Tube);
      expect(content.tutorials[0]).to.be.instanceOf(Tutorial);
      expect(content.trainings[0]).to.be.instanceOf(Training);
    });

    it('should return a version for locale "fr-fr"', function() {
      const content = Content.from(data);

      const expectedAreaFrFr = domainBuilder.buildArea.withLocaleFrFr({
        id: 'recAreaA',
        code: 'codeAreaA',
        name: 'nameAreaA',
        color: 'colorAreaA',
        title: 'Information et données',
        competenceIds: ['recCompA', 'recCompB'],
        competenceAirtableIds: ['recAirCompA', 'recAirCompB'],
        frameworkId: 'recFrameworkA',
      });

      const expectedCompetenceFrFr = domainBuilder.buildCompetence.withLocaleFrFr({
        id: 'recCompetenceA',
        name: 'nameFrCompetenceA',
        index: '1.2',
        areaId: 'recAreaA',
        origin: 'Pix',
        skillIds: [],
        thematicIds: [],
        description: 'descriptionFrCompetenceA',
      });

      const expectedSkillFrFr = domainBuilder.buildSkill.withLocaleFrFr({
        id: 'recSkillA',
        name: 'nameSkillA',
        hint: 'hintFr',
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

      const expectedContent = {
        areas: [expectedAreaFrFr],
        competences: [expectedCompetenceFrFr],
        challenges: [{ id: 123 }],
        courses: [{ id: 123 }],
        skills: [expectedSkillFrFr],
        tubes: [{ id: 123, practicalTitleFrFr: 'titre pratique', practicalTitle: 'titre pratique', practicalDescriptionFrFr: 'description pratique',  practicalDescription: 'description pratique' }],
        tutorials: [{ id: 123 }],
        trainings: [{ id: 345 }],
      };

      expect(content['fr-fr']).to.shallowDeepEqual(expectedContent);
    });

    it('should return a version for locale "en"', function() {
      const content = Content.from(data);

      const expectedAreaEnUs = domainBuilder.buildArea.withLocaleEnUs({
        id: 'recAreaA',
        code: 'codeAreaA',
        name: 'nameAreaA',
        color: 'colorAreaA',
        title: 'Information and data',
        competenceIds: ['recCompA', 'recCompB'],
        competenceAirtableIds: ['recAirCompA', 'recAirCompB'],
        frameworkId: 'recFrameworkA',
      });

      const expectedCompetenceEnUs = domainBuilder.buildCompetence.withLocaleEnUs({
        id: 'recCompetenceA',
        name: 'nameEnCompetenceA',
        index: '1.2',
        areaId: 'recAreaA',
        origin: 'Pix',
        skillIds: [],
        thematicIds: [],
        description: 'descriptionEnCompetenceA',
      });

      const expectedSkillEnUs = domainBuilder.buildSkill.withLocaleEnUs({
        id: 'recSkillA',
        name: 'nameSkillA',
        hint: 'hintEn',
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

      const expectedContent = {
        areas: [expectedAreaEnUs],
        competences: [expectedCompetenceEnUs],
        challenges: [{ id: 123 }],
        courses: [{ id: 123 }],
        skills: [expectedSkillEnUs],
        tubes: [{ id: 123, practicalTitleEnUs: 'practical title', practicalTitle: 'practical title', practicalDescriptionEnUs: 'practical description',  practicalDescription: 'practical description' }],
        tutorials: [{ id: 123 }],
        trainings: [{ id: 345 }],
      };
      expect(content['en']).to.shallowDeepEqual(expectedContent);
    });

    it('should return a version for locale "fr"', function() {
      const content = Content.from(data);

      const expectedAreaFr = domainBuilder.buildArea.withLocaleFr({
        id: 'recAreaA',
        code: 'codeAreaA',
        name: 'nameAreaA',
        color: 'colorAreaA',
        title: 'Information et données',
        competenceIds: ['recCompA', 'recCompB'],
        competenceAirtableIds: ['recAirCompA', 'recAirCompB'],
        frameworkId: 'recFrameworkA',
      });

      const expectedCompetenceFr = domainBuilder.buildCompetence.withLocaleFr({
        id: 'recCompetenceA',
        name: 'nameFrCompetenceA',
        index: '1.2',
        areaId: 'recAreaA',
        origin: 'Pix',
        skillIds: [],
        thematicIds: [],
        description: 'descriptionFrCompetenceA',
      });

      const expectedSkillFr = domainBuilder.buildSkill.withLocaleFr({
        id: 'recSkillA',
        name: 'nameSkillA',
        hint: 'hintFr',
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

      const expectedContent = {
        areas: [expectedAreaFr],
        competences: [expectedCompetenceFr],
        challenges: [{ id: 123 }],
        courses: [{ id: 123 }],
        skills: [expectedSkillFr],
        tubes: [{ id: 123, practicalTitleFrFr: 'titre pratique', practicalTitle: 'titre pratique', practicalDescriptionFrFr: 'description pratique',  practicalDescription: 'description pratique' }],
        tutorials: [{ id: 123 }],
        trainings: [{ id: 345 }],
      };
      expect(content['fr']).to.shallowDeepEqual(expectedContent);
    });
  });
});
