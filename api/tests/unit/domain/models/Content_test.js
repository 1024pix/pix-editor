const _ = require('lodash');
const { expect, domainBuilder } = require('../../../test-helper');
const Content = require('../../../../lib/domain/models/Content');

describe('Unit | Domain | Content', () => {
  describe('#buildForRelease', () => {
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
      const frameworkAirtable = domainBuilder.buildFrameworkAirtableDataObject({ id: 'recFramework', name: 'le framework' });
      data = {
        areas: [areaAirtable],
        competences: [competenceAirtable],
        challenges: [challengeAirtable],
        courses: [courseAirtable],
        skills: [skillAirtable],
        tubes: [tubeAirtable],
        tutorials: [tutorialAirtable],
        thematics: [thematicAirtable],
        frameworks: [frameworkAirtable],
      };
    });

    it('should return a Content model', function() {
      const contentForRelease = Content.buildForRelease({});

      expect(contentForRelease).to.be.instanceOf(Content);
    });

    it('should return a Content model with models as attributes', function() {
      const contentForRelease = Content.buildForRelease(data);

      const expectedArea = domainBuilder.buildAreaForRelease({
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
      const expectedCompetence = domainBuilder.buildCompetenceForRelease({
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
      const expectedSkill = domainBuilder.buildSkillForRelease({
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
      const expectedTube = domainBuilder.buildTubeForRelease({
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
      const expectedTutorial = domainBuilder.buildTutorialForRelease({
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
      const expectedThematic = domainBuilder.buildThematicForRelease({
        id: 'recThematic1',
        name: 'Nom de la thématique',
        nameEnUs: 'Name of the thematic',
        competenceId: 'recCompetence0',
        tubeIds: ['recTube0'],
        index: 0,
        locale: null,
      });
      const expectedCourse = domainBuilder.buildCourseForRelease({
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
      });
      const expectedFramework = domainBuilder.buildFrameworkForRelease({ id: 'recFramework', name: 'le framework' });

      const expectedContentForRelease = {
        areas: [expectedArea],
        competences: [expectedCompetence],
        challenges: [expectedChallenge],
        courses: [expectedCourse],
        skills: [expectedSkill],
        tubes: [expectedTube],
        tutorials: [expectedTutorial],
        thematics: [expectedThematic],
        frameworks: [expectedFramework],
      };

      expect(_.omit(contentForRelease, ['fr-fr', 'fr', 'en'])).to.deep.equal(expectedContentForRelease);
    });

    it('should return a version for locale "fr-fr"', function() {
      const contentForRelease = Content.buildForRelease(data);

      const expectedAreaFrFr = domainBuilder.buildAreaForRelease.withLocaleFrFr({
        id: 'recAreaA',
        code: 'codeAreaA',
        name: 'nameAreaA',
        color: 'colorAreaA',
        title: 'Information et données',
        competenceIds: ['recCompA', 'recCompB'],
        competenceAirtableIds: ['recAirCompA', 'recAirCompB'],
        frameworkId: 'recFrameworkA',
      });
      const expectedCompetenceFrFr = domainBuilder.buildCompetenceForRelease.withLocaleFrFr({
        id: 'recCompetenceA',
        name: 'nameFrCompetenceA',
        index: '1.2',
        areaId: 'recAreaA',
        origin: 'Pix',
        skillIds: [],
        thematicIds: [],
        description: 'descriptionFrCompetenceA',
      });
      const expectedSkillFrFr = domainBuilder.buildSkillForRelease.withLocaleFrFr({
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
      const expectedTubeFrFr = domainBuilder.buildTubeForRelease.withLocaleFrFr({
        id: 'recTubeA',
        name: 'nameTubeA',
        title: 'titleTubeA',
        description: 'descriptionTubeA',
        practicalTitle: 'practicalTitleFr',
        practicalDescription: 'practicalDescriptionFr',
        competenceId: 'recCompetence1',
      });
      const expectedTutorialFrFr = domainBuilder.buildTutorialForRelease({
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
      const expectedThematicFrFr = domainBuilder.buildThematicForRelease.withLocaleFrFr({
        id: 'recThematic1',
        name: 'Nom de la thématique',
        competenceId: 'recCompetence0',
        tubeIds: ['recTube0'],
        index: 0,
      });
      const expectedCourseFrFr = domainBuilder.buildCourseForRelease({
        id: 'recCourse1',
        description: 'descriptionCourse1',
        imageUrl: 'http://www.example.com/this-is-an-example.jpg',
        name: 'nameCourse1',
        challenges: ['recChallengeId1'],
        competences: ['recCompetenceId1'],
      });
      const expectedChallengeFrFr = domainBuilder.buildChallengeForRelease({
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
      const expectedFrameworkFrFr = domainBuilder.buildFrameworkForRelease({ id: 'recFramework', name: 'le framework' });

      const expectedContentForRelease = {
        areas: [expectedAreaFrFr],
        competences: [expectedCompetenceFrFr],
        challenges: [expectedChallengeFrFr],
        courses: [expectedCourseFrFr],
        skills: [expectedSkillFrFr],
        tubes: [expectedTubeFrFr],
        tutorials: [expectedTutorialFrFr],
        thematics: [expectedThematicFrFr],
        frameworks: [expectedFrameworkFrFr],
      };

      expect(contentForRelease['fr-fr']).to.deep.equal(expectedContentForRelease);
    });

    it('should return a version for locale "en"', function() {
      const contentForRelease = Content.buildForRelease(data);

      const expectedAreaEnUs = domainBuilder.buildAreaForRelease.withLocaleEnUs({
        id: 'recAreaA',
        code: 'codeAreaA',
        name: 'nameAreaA',
        color: 'colorAreaA',
        title: 'Information and data',
        competenceIds: ['recCompA', 'recCompB'],
        competenceAirtableIds: ['recAirCompA', 'recAirCompB'],
        frameworkId: 'recFrameworkA',
      });
      const expectedCompetenceEnUs = domainBuilder.buildCompetenceForRelease.withLocaleEnUs({
        id: 'recCompetenceA',
        name: 'nameEnCompetenceA',
        index: '1.2',
        areaId: 'recAreaA',
        origin: 'Pix',
        skillIds: [],
        thematicIds: [],
        description: 'descriptionEnCompetenceA',
      });
      const expectedSkillEnUs = domainBuilder.buildSkillForRelease.withLocaleEnUs({
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
      const expectedTubeEnUs = domainBuilder.buildTubeForRelease.withLocaleEnUs({
        id: 'recTubeA',
        name: 'nameTubeA',
        title: 'titleTubeA',
        description: 'descriptionTubeA',
        practicalTitle: 'practicalTitleEn',
        practicalDescription: 'practicalDescriptionEn',
        competenceId: 'recCompetence1',
      });
      const expectedTutorialEnUs = domainBuilder.buildTutorialForRelease({
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
      const expectedThematicEnUs = domainBuilder.buildThematicForRelease.withLocaleEnUs({
        id: 'recThematic1',
        name: 'Name of the thematic',
        competenceId: 'recCompetence0',
        tubeIds: ['recTube0'],
        index: 0,
      });
      const expectedCourseEnUs = domainBuilder.buildCourseForRelease({
        id: 'recCourse1',
        description: 'descriptionCourse1',
        imageUrl: 'http://www.example.com/this-is-an-example.jpg',
        name: 'nameCourse1',
        challenges: ['recChallengeId1'],
        competences: ['recCompetenceId1'],
      });
      const expectedChallengeEnUs = domainBuilder.buildChallengeForRelease({
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
      const expectedFrameworkEnUs = domainBuilder.buildFrameworkForRelease({ id: 'recFramework', name: 'le framework' });

      const expectedContentForRelease = {
        areas: [expectedAreaEnUs],
        competences: [expectedCompetenceEnUs],
        challenges: [expectedChallengeEnUs],
        courses: [expectedCourseEnUs],
        skills: [expectedSkillEnUs],
        tubes: [expectedTubeEnUs],
        tutorials: [expectedTutorialEnUs],
        thematics: [expectedThematicEnUs],
        frameworks: [expectedFrameworkEnUs],
      };
      expect(contentForRelease['en']).to.deep.equal(expectedContentForRelease);
    });

    it('should return a version for locale "fr"', function() {
      const contentForRelease = Content.buildForRelease(data);

      const expectedAreaFr = domainBuilder.buildAreaForRelease.withLocaleFr({
        id: 'recAreaA',
        code: 'codeAreaA',
        name: 'nameAreaA',
        color: 'colorAreaA',
        title: 'Information et données',
        competenceIds: ['recCompA', 'recCompB'],
        competenceAirtableIds: ['recAirCompA', 'recAirCompB'],
        frameworkId: 'recFrameworkA',
      });
      const expectedCompetenceFr = domainBuilder.buildCompetenceForRelease.withLocaleFr({
        id: 'recCompetenceA',
        name: 'nameFrCompetenceA',
        index: '1.2',
        areaId: 'recAreaA',
        origin: 'Pix',
        skillIds: [],
        thematicIds: [],
        description: 'descriptionFrCompetenceA',
      });
      const expectedSkillFr = domainBuilder.buildSkillForRelease.withLocaleFr({
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
      const expectedTubeFr = domainBuilder.buildTubeForRelease.withLocaleFr({
        id: 'recTubeA',
        name: 'nameTubeA',
        title: 'titleTubeA',
        description: 'descriptionTubeA',
        practicalTitle: 'practicalTitleFr',
        practicalDescription: 'practicalDescriptionFr',
        competenceId: 'recCompetence1',
        locale: null,
      });
      const expectedTutorialFr = domainBuilder.buildTutorialForRelease({
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
      const expectedThematicFr = domainBuilder.buildThematicForRelease.withLocaleFr({
        id: 'recThematic1',
        name: 'Nom de la thématique',
        competenceId: 'recCompetence0',
        tubeIds: ['recTube0'],
        index: 0,
      });
      const expectedCourseFr = domainBuilder.buildCourseForRelease({
        id: 'recCourse1',
        description: 'descriptionCourse1',
        imageUrl: 'http://www.example.com/this-is-an-example.jpg',
        name: 'nameCourse1',
        challenges: ['recChallengeId1'],
        competences: ['recCompetenceId1'],
      });
      const expectedChallengeFr = domainBuilder.buildChallengeForRelease({
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
      const expectedFrameworkFr = domainBuilder.buildFrameworkForRelease({ id: 'recFramework', name: 'le framework' });

      const expectedContentForRelease = {
        areas: [expectedAreaFr],
        competences: [expectedCompetenceFr],
        challenges: [expectedChallengeFr],
        courses: [expectedCourseFr],
        skills: [expectedSkillFr],
        tubes: [expectedTubeFr],
        tutorials: [expectedTutorialFr],
        thematics: [expectedThematicFr],
        frameworks: [expectedFrameworkFr],
      };
      expect(contentForRelease['fr']).to.deep.equal(expectedContentForRelease);
    });
  });
});
