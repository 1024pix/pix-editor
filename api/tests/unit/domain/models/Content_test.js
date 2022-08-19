const { expect, domainBuilder } = require('../../../test-helper');
const Content = require('../../../../lib/domain/models/Content');
const Challenge = require('../../../../lib/domain/models/Challenge');
const Course = require('../../../../lib/domain/models/Course');
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
      const tubeAirtable = domainBuilder.buildTubeAirtableDataObject({
        id: 'recTubeA',
        name: 'nameTubeA',
        title: 'titleTubeA',
        description: 'descriptionTubeA',
        practicalTitleFrFr: 'practicalTitleFr',
        practicalTitleEnUs: 'practicalTitleEn',
        practicalDescriptionFrFr: 'practicalDescriptionFr',
        practicalDescriptionEnUs: 'practicalDescriptionEn',
        competenceId: 'recCompetence1',
      });
      const tutorialAirtable = domainBuilder.buildTutorialAirtableDataObject({
        id: 'recTutorialA',
        duration: '00:03:31',
        format: 'vidéo',
        link: 'http://www.example.com/this-is-an-example.html',
        source: 'sourceA',
        title: 'titleA',
        locale: 'any',
        tutorialForSkills: ['skillId1'],
        furtherInformation: ['skillId2'],
      });
      data = {
        areas: [areaAirtable],
        competences: [competenceAirtable],
        challenges: [{ id: 123 }],
        courses: [{ id: 123 }],
        skills: [skillAirtable],
        tubes: [tubeAirtable],
        tutorials: [tutorialAirtable],
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
        locale: null,
      });
      const expectedTube = domainBuilder.buildTube({
        id: 'recTubeA',
        name: 'nameTubeA',
        title: 'titleTubeA',
        description: 'descriptionTubeA',
        practicalTitleFrFr: 'practicalTitleFr',
        practicalTitleEnUs: 'practicalTitleEn',
        practicalDescriptionFrFr: 'practicalDescriptionFr',
        practicalDescriptionEnUs: 'practicalDescriptionEn',
        competenceId: 'recCompetence1',
        locale: null,
      });
      const expectedTutorial = domainBuilder.buildTutorial({
        id: 'recTutorialA',
        duration: '00:03:31',
        format: 'vidéo',
        link: 'http://www.example.com/this-is-an-example.html',
        source: 'sourceA',
        title: 'titleA',
        locale: 'any',
        tutorialForSkills: ['skillId1'],
        furtherInformation: ['skillId2'],
      });

      expect(content.areas).to.deep.equal([expectedArea]);
      expect(content.competences).to.deep.equal([expectedCompetence]);
      expect(content.challenges[0]).to.be.instanceOf(Challenge);
      expect(content.courses[0]).to.be.instanceOf(Course);
      expect(content.skills).to.deep.equal([expectedSkill]);
      expect(content.tubes).to.deep.equal([expectedTube]);
      expect(content.tutorials).to.deep.equal([expectedTutorial]);
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
      const expectedTubeFrFr = domainBuilder.buildTube.withLocaleFrFr({
        id: 'recTubeA',
        name: 'nameTubeA',
        title: 'titleTubeA',
        description: 'descriptionTubeA',
        practicalTitle: 'practicalTitleFr',
        practicalDescription: 'practicalDescriptionFr',
        competenceId: 'recCompetence1',
      });
      const expectedTutorialFrFr = domainBuilder.buildTutorial({
        id: 'recTutorialA',
        duration: '00:03:31',
        format: 'vidéo',
        link: 'http://www.example.com/this-is-an-example.html',
        source: 'sourceA',
        title: 'titleA',
        locale: 'any',
        tutorialForSkills: ['skillId1'],
        furtherInformation: ['skillId2'],
      });

      const expectedContent = {
        areas: [expectedAreaFrFr],
        competences: [expectedCompetenceFrFr],
        challenges: [{ id: 123 }],
        courses: [{ id: 123 }],
        skills: [expectedSkillFrFr],
        tubes: [expectedTubeFrFr],
        tutorials: [expectedTutorialFrFr],
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
      const expectedTubeEnUs = domainBuilder.buildTube.withLocaleEnUs({
        id: 'recTubeA',
        name: 'nameTubeA',
        title: 'titleTubeA',
        description: 'descriptionTubeA',
        practicalTitle: 'practicalTitleEn',
        practicalDescription: 'practicalDescriptionEn',
        competenceId: 'recCompetence1',
      });
      const expectedTutorialEnUs = domainBuilder.buildTutorial({
        id: 'recTutorialA',
        duration: '00:03:31',
        format: 'vidéo',
        link: 'http://www.example.com/this-is-an-example.html',
        source: 'sourceA',
        title: 'titleA',
        locale: 'any',
        tutorialForSkills: ['skillId1'],
        furtherInformation: ['skillId2'],
      });

      const expectedContent = {
        areas: [expectedAreaEnUs],
        competences: [expectedCompetenceEnUs],
        challenges: [{ id: 123 }],
        courses: [{ id: 123 }],
        skills: [expectedSkillEnUs],
        tubes: [expectedTubeEnUs],
        tutorials: [expectedTutorialEnUs],
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
      const expectedTubeFr = domainBuilder.buildTube.withLocaleFr({
        id: 'recTubeA',
        name: 'nameTubeA',
        title: 'titleTubeA',
        description: 'descriptionTubeA',
        practicalTitle: 'practicalTitleFr',
        practicalDescription: 'practicalDescriptionFr',
        competenceId: 'recCompetence1',
        locale: null,
      });
      const expectedTutorialFr = domainBuilder.buildTutorial({
        id: 'recTutorialA',
        duration: '00:03:31',
        format: 'vidéo',
        link: 'http://www.example.com/this-is-an-example.html',
        source: 'sourceA',
        title: 'titleA',
        locale: 'any',
        tutorialForSkills: ['skillId1'],
        furtherInformation: ['skillId2'],
      });

      const expectedContent = {
        areas: [expectedAreaFr],
        competences: [expectedCompetenceFr],
        challenges: [{ id: 123 }],
        courses: [{ id: 123 }],
        skills: [expectedSkillFr],
        tubes: [expectedTubeFr],
        tutorials: [expectedTutorialFr],
        trainings: [{ id: 345 }],
      };
      expect(content['fr']).to.shallowDeepEqual(expectedContent);
    });
  });
});
