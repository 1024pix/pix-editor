const { expect, domainBuilder } = require('../../../test-helper');
const Content = require('../../../../lib/domain/models/Content');

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
      const thematicAirtable = domainBuilder.buildThematicAirtableDataObject({
        id: 'recThematic1',
        name: 'Nom de la thématique',
        nameEnUs: 'Name of the thematic',
        competenceId: 'recCompetence0',
        tubeIds: ['recTube0'],
        index: 0,
      });
      const courseAirtable = domainBuilder.buildCourseAirtableDataObject({
        id: 'recCourse1',
        description: 'descriptionCourse1',
        imageUrl: 'http://www.example.com/this-is-an-example.jpg',
        name: 'nameCourse1',
        challenges: ['recChallengeId1'],
        competences: ['recCompetenceId1'],
      });
      const challengeAirtable = domainBuilder.buildChallengeAirtableDataObject({
        id: 'recChallengeA',
        instruction: 'instructionChallengeA',
        alternativeInstruction: 'alternativeInstructionChallengeA',
        proposals: 'proposalsChallengeA',
        type: 'QCM',
        solution: 'solutionChallengeA',
        solutionToDisplay: 'solutionToDisplayChallengeA',
        t1Status: 'Activé',
        t2Status: 'Désactivé',
        t3Status: 'Activé',
        status: 'validé',
        skillId: 'recSkillId1',
        timer: 1234,
        competenceId: 'recCompetence1',
        embedUrl: 'http://www.example.com/this-is-an-example.html',
        embedTitle: 'embedTitleChallenge',
        embedHeight: 500,
        format: 'mots',
        autoReply: false,
        locales: ['any'],
        focusable: false,
        delta: 0.2,
        alpha: 0.5,
        responsive: 'Smartphone',
        genealogy: 'Prototype 1',
      });
      challengeAirtable.attachments = ['some_url'];
      data = {
        areas: [areaAirtable],
        competences: [competenceAirtable],
        challenges: [challengeAirtable],
        courses: [courseAirtable],
        skills: [skillAirtable],
        tubes: [tubeAirtable],
        tutorials: [tutorialAirtable],
        thematics: [thematicAirtable],
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
      const expectedThematic = domainBuilder.buildThematic({
        id: 'recThematic1',
        name: 'Nom de la thématique',
        nameEnUs: 'Name of the thematic',
        competenceId: 'recCompetence0',
        tubeIds: ['recTube0'],
        index: 0,
      });
      const expectedCourse = domainBuilder.buildCourse({
        id: 'recCourse1',
        description: 'descriptionCourse1',
        imageUrl: 'http://www.example.com/this-is-an-example.jpg',
        name: 'nameCourse1',
        challenges: ['recChallengeId1'],
        competences: ['recCompetenceId1'],
      });
      const expectedChallenge = domainBuilder.buildChallengeForRelease({
        id: 'recChallengeA',
        instruction: 'instructionChallengeA',
        alternativeInstruction: 'alternativeInstructionChallengeA',
        proposals: 'proposalsChallengeA',
        type: 'QCM',
        solution: 'solutionChallengeA',
        solutionToDisplay: 'solutionToDisplayChallengeA',
        t1Status: 'Activé',
        t2Status: 'Désactivé',
        t3Status: 'Activé',
        status: 'validé',
        skillId: 'recSkillId1',
        timer: 1234,
        competenceId: 'recCompetence1',
        embedUrl: 'http://www.example.com/this-is-an-example.html',
        embedTitle: 'embedTitleChallenge',
        embedHeight: 500,
        format: 'mots',
        autoReply: false,
        locales: ['any'],
        focusable: false,
        delta: 0.2,
        alpha: 0.5,
        responsive: 'Smartphone',
        genealogy: 'Prototype 1',
        attachments: ['some_url'],
      });

      expect(content.areas).to.deepEqualArray([expectedArea]);
      expect(content.competences).to.deepEqualArray([expectedCompetence]);
      expect(content.challenges).to.deepEqualArray([expectedChallenge]);
      expect(content.courses).to.deepEqualArray([expectedCourse]);
      expect(content.skills).to.deepEqualArray([expectedSkill]);
      expect(content.tubes).to.deepEqualArray([expectedTube]);
      expect(content.tutorials).to.deepEqualArray([expectedTutorial]);
      expect(content.thematics).to.deepEqualArray([expectedThematic]);
    });
  });
});
