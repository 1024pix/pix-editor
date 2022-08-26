const { expect, airtableBuilder, databaseBuilder, generateAuthorizationHeader, sinon } = require('../../../test-helper');
const createServer = require('../../../../server');
const axios = require('axios');

const {
  buildArea,
  buildAttachment,
  buildChallenge,
  buildCompetence,
  buildCourse,
  buildFramework,
  buildSkill,
  buildThematic,
  buildTube,
  buildTutorial,
} = airtableBuilder.factory;

async function mockCurrentContent() {

  const expectedCurrentContent = {
    areas: [{
      id: 'recArea0',
      name: 'Nom du Domaine',
      code: '1',
      titleFrFr: 'Titre du Domaine - fr',
      titleEnUs: 'Titre du Domaine - en',
      competenceIds: ['recCompetence0'],
      competenceAirtableIds: ['recCompetence123'],
      color: 'jaffa',
      frameworkId: 'recFramework0',
    }],
    competences: [{
      id: 'recCompetence0',
      index: '1.1',
      name: 'Nom de la Compétence',
      nameFrFr: 'Nom de la Compétence - fr',
      nameEnUs: 'Nom de la Compétence - en',
      areaId: '1',
      origin: 'Pix',
      skillIds: ['recSkill0'],
      thematicIds: ['recThematic0'],
      description: 'Description de la compétence',
      descriptionFrFr: 'Description de la compétence - fr',
      descriptionEnUs: 'Description de la compétence - en',
    }],
    frameworks: [{
      id: 'recFramework0',
      name: 'Nom du referentiel'
    }],
    tubes: [{
      id: 'recTube0',
      name: 'Nom du Tube',
      title: 'Titre du Tube',
      description: 'Description du Tube',
      practicalTitleFrFr: 'Titre pratique du Tube - fr',
      practicalTitleEnUs: 'Titre pratique du Tube - en',
      practicalDescriptionFrFr: 'Description pratique du Tube - fr',
      practicalDescriptionEnUs: 'Description pratique du Tube - en',
      competenceId: 'recCompetence0',
    }],
    skills: [{
      id: 'recSkill0',
      name: 'Nom de l‘Acquis',
      hintFrFr: 'Indice - fr',
      hintEnUs: 'Indice - en',
      hintStatus: 'Statut de l‘indice',
      tutorialIds: ['recTutorial0'],
      learningMoreTutorialIds: ['recTutorial1'],
      pixValue: 8,
      competenceId: 'recCompetence0',
      status: 'validé',
      tubeId: 'recTube0',
      version: 1,
      level: 1,
    }],
    challenges: [{
      id: 'recChallenge0',
      instruction: 'Consigne du Challenge',
      proposals: 'Propositions du Challenge',
      type: 'Type d\'épreuve',
      solution: 'Bonnes réponses du Challenge',
      solutionToDisplay: 'Bonnes réponses du Challenge à afficher',
      t1Status: false,
      t2Status: true,
      t3Status: false,
      status: 'Statut du Challenge',
      skillId: 'recSkill0',
      embedUrl: 'Embed URL',
      embedTitle: 'Embed title',
      embedHeight: 'Embed height',
      timer: 12,
      illustrationUrl: 'url de l‘illustration',
      attachments: ['url de la pièce jointe'],
      competenceId: 'recCompetence0',
      illustrationAlt: 'Texte alternatif illustration',
      format: 'mots',
      autoReply: false,
      locales: ['fr-fr'],
      alternativeInstruction: 'Consigne alternative',
      focusable: false,
      delta: 0.5,
      alpha: 0.9,
      responsive: 'Smartphone',
      genealogy: 'Prototype 1',
    }],
    tutorials: [{
      id: 'recTutorial0',
      duration: 'Durée du Tutoriel',
      format: 'Format du Tutoriel',
      link: 'Lien du Tutoriel',
      source: 'Source du Tutoriel',
      title: 'Titre du Tutoriel',
      locale: 'Langue du Tutoriel',
    }],
    courses: [{
      id: 'recCourse0',
      name: 'Nom du Course',
      description: 'Description du Course',
      competences: ['recCompetence0'],
      challenges: ['recChallenge0'],
      imageUrl: 'Image du Course',
    }],
    thematics: [{
      id: 'recThematic0',
      name: 'Nom',
      nameEnUs: 'name',
      competenceId: 'recCompetence0',
      tubeIds: ['recTube'],
      index: 0
    }],
  };

  const attachments = [{
    url: 'url de l‘illustration',
    alt: 'Texte alternatif illustration',
    type: 'illustration',
    challengeId: 'recChallenge0',
  }, {
    url: 'url de la pièce jointe',
    type: 'attachment',
    challengeId: 'recChallenge0',
  }];

  airtableBuilder.mockLists({
    areas: [buildArea(expectedCurrentContent.areas[0])],
    attachments: attachments.map(buildAttachment),
    challenges: [buildChallenge(expectedCurrentContent.challenges[0])],
    competences: [buildCompetence(expectedCurrentContent.competences[0])],
    courses: [buildCourse(expectedCurrentContent.courses[0])],
    frameworks: [buildFramework(expectedCurrentContent.frameworks[0])],
    skills: [buildSkill(expectedCurrentContent.skills[0])],
    thematics: expectedCurrentContent.thematics.map(buildThematic),
    tubes: [buildTube(expectedCurrentContent.tubes[0])],
    tutorials: [buildTutorial(expectedCurrentContent.tutorials[0])],
  });

  return expectedCurrentContent;
}

async function mockContentForRelease() {
  const expectedCurrentContent = {
    areas: [{
      id: 'recArea0',
      name: 'Nom du Domaine',
      code: '1',
      titleFrFr: 'Titre du Domaine - fr',
      titleEnUs: 'Titre du Domaine - en',
      competenceIds: ['recCompetence0'],
      competenceAirtableIds: ['recCompetence123'],
      color: 'jaffa',
      frameworkId: 'recFramework0',
    }],
    competences: [{
      id: 'recCompetence0',
      index: '1.1',
      name: 'Nom de la Compétence',
      nameFrFr: 'Nom de la Compétence - fr',
      nameEnUs: 'Nom de la Compétence - en',
      areaId: '1',
      origin: 'Pix',
      skillIds: ['recSkill0'],
      thematicIds: ['recThematic0'],
      description: 'Description de la compétence',
      descriptionFrFr: 'Description de la compétence - fr',
      descriptionEnUs: 'Description de la compétence - en',
    }],
    frameworks: [{
      id: 'recFramework0',
      name: 'Nom du referentiel'
    }],
    tubes: [{
      id: 'recTube0',
      name: 'Nom du Tube',
      title: 'Titre du Tube',
      description: 'Description du Tube',
      practicalTitleFrFr: 'Titre pratique du Tube - fr',
      practicalTitleEnUs: 'Titre pratique du Tube - en',
      practicalDescriptionFrFr: 'Description pratique du Tube - fr',
      practicalDescriptionEnUs: 'Description pratique du Tube - en',
      competenceId: 'recCompetence0',
    }],
    skills: [{
      id: 'recSkill0',
      name: 'Nom de l‘Acquis',
      hintFrFr: 'Indice - fr',
      hintEnUs: 'Indice - en',
      hintStatus: 'Statut de l‘indice',
      tutorialIds: ['recTutorial0'],
      learningMoreTutorialIds: ['recTutorial1'],
      pixValue: 8,
      competenceId: 'recCompetence0',
      status: 'validé',
      tubeId: 'recTube0',
      version: 1,
      level: 1,
    }],
    challenges: [{
      id: 'recChallenge0',
      instruction: 'Consigne du Challenge',
      proposals: 'Propositions du Challenge',
      type: 'Type d\'épreuve',
      solution: 'Bonnes réponses du Challenge',
      solutionToDisplay: 'Bonnes réponses du Challenge à afficher',
      t1Status: false,
      t2Status: true,
      t3Status: false,
      status: 'Statut du Challenge',
      skillId: 'recSkill0',
      embedUrl: 'Embed URL',
      embedTitle: 'Embed title',
      embedHeight: 'Embed height',
      timer: 12,
      competenceId: 'recCompetence0',
      format: 'mots',
      autoReply: false,
      locales: ['fr-fr'],
      alternativeInstruction: 'Consigne alternative',
      focusable: false,
      delta: 0.5,
      alpha: 0.9,
      responsive: 'Smartphone',
      genealogy: 'Prototype 1',
    }],
    tutorials: [{
      id: 'recTutorial0',
      duration: 'Durée du Tutoriel',
      format: 'Format du Tutoriel',
      link: 'Lien du Tutoriel',
      source: 'Source du Tutoriel',
      title: 'Titre du Tutoriel',
      locale: 'fr-fr',
    }],
    courses: [{
      id: 'recCourse0',
      name: 'Nom du Course',
      description: 'Description du Course',
      competences: ['recCompetence0'],
      challenges: ['recChallenge0'],
      imageUrl: 'Image du Course',
    }],
    thematics: [{
      id: 'recThematic0',
      name: 'Nom',
      nameEnUs: 'name',
      competenceId: 'recCompetence0',
      tubeIds: ['recTube'],
      index: 0
    }],
    en: {
      areas: [{
        code: '1',
        color: 'jaffa',
        competenceAirtableIds: ['recCompetence123'],
        competenceIds: ['recCompetence0'],
        frameworkId: 'recFramework0',
        id: 'recArea0',
        name: 'Nom du Domaine',
        title: 'Titre du Domaine - en',
        titleEnUs: 'Titre du Domaine - en',
      }],
      challenges: [{
        alpha: 0.9,
        alternativeInstruction: 'Consigne alternative',
        autoReply: false,
        competenceId: 'recCompetence0',
        delta: 0.5,
        embedHeight: 'Embed height',
        embedTitle: 'Embed title',
        embedUrl: 'Embed URL',
        focusable: false,
        format: 'mots',
        genealogy: 'Prototype 1',
        id: 'recChallenge0',
        instruction: 'Consigne du Challenge',
        locales: ['fr-fr'],
        proposals: 'Propositions du Challenge',
        responsive: 'Smartphone',
        skillId: 'recSkill0',
        solution: 'Bonnes réponses du Challenge',
        solutionToDisplay: 'Bonnes réponses du Challenge à afficher',
        status: 'Statut du Challenge',
        t1Status: false,
        t2Status: true,
        t3Status: false,
        timer: 12,
        type: 'Type d\'épreuve',
      }],
      competences: [{
        areaId: '1',
        description: 'Description de la compétence - en',
        descriptionEnUs: 'Description de la compétence - en',
        id: 'recCompetence0',
        index: '1.1',
        name: 'Nom de la Compétence - en',
        nameEnUs: 'Nom de la Compétence - en',
        origin: 'Pix',
        skillIds: ['recSkill0'],
        thematicIds: ['recThematic0'],
      },],
      courses: [{
        challenges: ['recChallenge0'],
        competences: ['recCompetence0'],
        description: 'Description du Course',
        id: 'recCourse0',
        imageUrl: 'Image du Course',
        name: 'Nom du Course',
      }],
      frameworks: [{
        id: 'recFramework0',
        name: 'Nom du referentiel',
      }],
      skills: [{
        competenceId: 'recCompetence0',
        hint: 'Indice - en',
        hintEnUs: 'Indice - en',
        hintStatus: 'Statut de l‘indice',
        id: 'recSkill0',
        learningMoreTutorialIds: ['recTutorial1',],
        level: 1,
        name: 'Nom de l‘Acquis',
        pixValue: 8,
        status: 'validé',
        tubeId: 'recTube0',
        tutorialIds: ['recTutorial0'],
        version: 1,
      }],
      thematics: [{
        competenceId: 'recCompetence0',
        id: 'recThematic0',
        index: 0,
        name: 'name',
        nameEnUs: 'name',
        tubeIds: ['recTube'],
      }],
      trainings: [{
        duration: { hours: 6 },
        id: 1000,
        link: 'https://magistere.education.fr/ac-normandie/enrol/index.php?id=5924',
        locale: 'fr-fr',
        targetProfileIds: [1822, 2214],
        title: 'Travail de groupe et collaboration entre les personnels',
        type: 'autoformation',
      }],
      tubes: [{
        competenceId: 'recCompetence0',
        description: 'Description du Tube',
        id: 'recTube0',
        name: 'Nom du Tube',
        practicalDescription: 'Description pratique du Tube - en',
        practicalDescriptionEnUs: 'Description pratique du Tube - en',
        practicalTitle: 'Titre pratique du Tube - en',
        practicalTitleEnUs: 'Titre pratique du Tube - en',
        title: 'Titre du Tube',
      }],
      tutorials: [],
    },
    fr: {
      areas: [{
        code: '1',
        color: 'jaffa',
        competenceAirtableIds: ['recCompetence123'],
        competenceIds: ['recCompetence0'],
        frameworkId: 'recFramework0',
        id: 'recArea0',
        name: 'Nom du Domaine',
        title: 'Titre du Domaine - fr',
        titleFrFr: 'Titre du Domaine - fr',
      }],
      challenges: [{
        alpha: 0.9,
        alternativeInstruction: 'Consigne alternative',
        autoReply: false,
        competenceId: 'recCompetence0',
        delta: 0.5,
        embedHeight: 'Embed height',
        embedTitle: 'Embed title',
        embedUrl: 'Embed URL',
        focusable: false,
        format: 'mots',
        genealogy: 'Prototype 1',
        id: 'recChallenge0',
        instruction: 'Consigne du Challenge',
        locales: ['fr-fr'],
        proposals: 'Propositions du Challenge',
        responsive: 'Smartphone',
        skillId: 'recSkill0',
        solution: 'Bonnes réponses du Challenge',
        solutionToDisplay: 'Bonnes réponses du Challenge à afficher',
        status: 'Statut du Challenge',
        t1Status: false,
        t2Status: true,
        t3Status: false,
        timer: 12,
        type: 'Type d\'épreuve',
      }],
      competences: [{
        areaId: '1',
        description: 'Description de la compétence - fr',
        descriptionFrFr: 'Description de la compétence - fr',
        id: 'recCompetence0',
        index: '1.1',
        name: 'Nom de la Compétence - fr',
        nameFrFr: 'Nom de la Compétence - fr',
        origin: 'Pix',
        skillIds: ['recSkill0'],
        thematicIds: ['recThematic0'],
      }],
      courses: [{
        challenges: ['recChallenge0'],
        competences: ['recCompetence0'],
        description: 'Description du Course',
        id: 'recCourse0',
        imageUrl: 'Image du Course',
        name: 'Nom du Course',
      }],
      frameworks: [{
        id: 'recFramework0',
        name: 'Nom du referentiel',
      }],
      skills: [{
        competenceId: 'recCompetence0',
        hint: 'Indice - fr',
        hintFrFr: 'Indice - fr',
        hintStatus: 'Statut de l‘indice',
        id: 'recSkill0',
        learningMoreTutorialIds: ['recTutorial1'],
        level: 1,
        name: 'Nom de l‘Acquis',
        pixValue: 8,
        status: 'validé',
        tubeId: 'recTube0',
        tutorialIds: ['recTutorial0'],
        version: 1,
      }],
      thematics: [{
        competenceId: 'recCompetence0',
        id: 'recThematic0',
        index: 0,
        name: 'Nom',
        tubeIds: ['recTube'],
      }],
      trainings: [{
        duration: { hours: 6 },
        id: 1000,
        link: 'https://magistere.education.fr/ac-normandie/enrol/index.php?id=5924',
        locale: 'fr-fr',
        targetProfileIds: [ 1822, 2214 ],
        title: 'Travail de groupe et collaboration entre les personnels',
        type: 'autoformation',
      }],
      tubes: [{
        competenceId: 'recCompetence0',
        description: 'Description du Tube',
        id: 'recTube0',
        name: 'Nom du Tube',
        practicalDescription: 'Description pratique du Tube - fr',
        practicalDescriptionFrFr: 'Description pratique du Tube - fr',
        practicalTitle: 'Titre pratique du Tube - fr',
        practicalTitleFrFr: 'Titre pratique du Tube - fr',
        title: 'Titre du Tube',
      }],
      tutorials: [{
        duration: 'Durée du Tutoriel',
        format: 'Format du Tutoriel',
        id: 'recTutorial0',
        link: 'Lien du Tutoriel',
        locale: 'fr-fr',
        source: 'Source du Tutoriel',
        title: 'Titre du Tutoriel',
      }],
    },
    'fr-fr': {
      areas: [{
        code: '1',
        color: 'jaffa',
        competenceAirtableIds: ['recCompetence123',],
        competenceIds: ['recCompetence0',],
        frameworkId: 'recFramework0',
        id: 'recArea0',
        name: 'Nom du Domaine',
        title: 'Titre du Domaine - fr',
        titleFrFr: 'Titre du Domaine - fr',
      }],
      challenges: [{
        alpha: 0.9,
        alternativeInstruction: 'Consigne alternative',
        autoReply: false,
        competenceId: 'recCompetence0',
        delta: 0.5,
        embedHeight: 'Embed height',
        embedTitle: 'Embed title',
        embedUrl: 'Embed URL',
        focusable: false,
        format: 'mots',
        genealogy: 'Prototype 1',
        id: 'recChallenge0',
        instruction: 'Consigne du Challenge',
        locales: ['fr-fr'],
        proposals: 'Propositions du Challenge',
        responsive: 'Smartphone',
        skillId: 'recSkill0',
        solution: 'Bonnes réponses du Challenge',
        solutionToDisplay: 'Bonnes réponses du Challenge à afficher',
        status: 'Statut du Challenge',
        t1Status: false,
        t2Status: true,
        t3Status: false,
        timer: 12,
        type: 'Type d\'épreuve',
      }],
      competences: [{
        areaId: '1',
        description: 'Description de la compétence - fr',
        descriptionFrFr: 'Description de la compétence - fr',
        id: 'recCompetence0',
        index: '1.1',
        name: 'Nom de la Compétence - fr',
        nameFrFr: 'Nom de la Compétence - fr',
        origin: 'Pix',
        skillIds: ['recSkill0'],
        thematicIds: ['recThematic0'],
      }],
      courses: [{
        challenges: ['recChallenge0'],
        competences: ['recCompetence0'],
        description: 'Description du Course',
        id: 'recCourse0',
        imageUrl: 'Image du Course',
        name: 'Nom du Course',
      }],
      frameworks: [{
        id: 'recFramework0',
        name: 'Nom du referentiel',
      },],
      skills: [{
        competenceId: 'recCompetence0',
        hint: 'Indice - fr',
        hintFrFr: 'Indice - fr',
        hintStatus: 'Statut de l‘indice',
        id: 'recSkill0',
        learningMoreTutorialIds: ['recTutorial1'],
        level: 1,
        name: 'Nom de l‘Acquis',
        pixValue: 8,
        status: 'validé',
        tubeId: 'recTube0',
        tutorialIds: ['recTutorial0'],
        version: 1,
      },],
      thematics: [{
        competenceId: 'recCompetence0',
        id: 'recThematic0',
        index: 0,
        name: 'Nom',
        tubeIds: ['recTube'],
      }],
      trainings: [{
        duration: { hours: 6 },
        id: 1000,
        link: 'https://magistere.education.fr/ac-normandie/enrol/index.php?id=5924',
        locale: 'fr-fr',
        targetProfileIds: [ 1822, 2214 ],
        title: 'Travail de groupe et collaboration entre les personnels',
        type: 'autoformation',
      }],
      tubes: [{
        competenceId: 'recCompetence0',
        description: 'Description du Tube',
        id: 'recTube0',
        name: 'Nom du Tube',
        practicalDescription: 'Description pratique du Tube - fr',
        practicalDescriptionFrFr: 'Description pratique du Tube - fr',
        practicalTitle: 'Titre pratique du Tube - fr',
        practicalTitleFrFr: 'Titre pratique du Tube - fr',
        title: 'Titre du Tube',
      },],
      tutorials: [{
        duration: 'Durée du Tutoriel',
        format: 'Format du Tutoriel',
        id: 'recTutorial0',
        link: 'Lien du Tutoriel',
        locale: 'fr-fr',
        source: 'Source du Tutoriel',
        title: 'Titre du Tutoriel',
      }],
    },
  };

  const attachments = [{
    url: 'url de l‘illustration',
    alt: 'Texte alternatif illustration',
    type: 'illustration',
    challengeId: 'recChallenge0',
  }, {
    url: 'url de la pièce jointe',
    type: 'attachment',
    challengeId: 'recChallenge0',
  }];

  airtableBuilder.mockLists({
    areas: [buildArea(expectedCurrentContent.areas[0])],
    attachments: attachments.map(buildAttachment),
    challenges: [buildChallenge(expectedCurrentContent.challenges[0])],
    competences: [buildCompetence(expectedCurrentContent.competences[0])],
    courses: [buildCourse(expectedCurrentContent.courses[0])],
    frameworks: [buildFramework(expectedCurrentContent.frameworks[0])],
    skills: [buildSkill(expectedCurrentContent.skills[0])],
    thematics: expectedCurrentContent.thematics.map(buildThematic),
    tubes: [buildTube(expectedCurrentContent.tubes[0])],
    tutorials: [buildTutorial(expectedCurrentContent.tutorials[0])],
  });

  return expectedCurrentContent;
}

describe('Acceptance | Controller | release-controller', () => {

  describe('GET /current-content - Returns release from current Airtable data', () => {
    context('nominal case', () => {
      let user;
      beforeEach(async function() {
        user = databaseBuilder.factory.buildAdminUser();
        await databaseBuilder.commit();
      });

      it('should return current learning content', async () => {
        // Given
        const expectedCurrentContent = await mockCurrentContent();

        const server = await createServer();
        const currentContentOptions = {
          method: 'GET',
          url: '/api/current-content',
          headers: generateAuthorizationHeader(user),
        };

        // When
        const response = await server.inject(currentContentOptions);

        // Then
        expect(JSON.parse(response.result)).to.deep.equal(JSON.parse(JSON.stringify(expectedCurrentContent)));
      });

      it('should handle error', async () => {
        // Given
        airtableBuilder.mockList({ tableName: 'Domaines' }).returns().activate(500);
        airtableBuilder.mockList({ tableName: 'Competences' }).returns().activate(500);
        airtableBuilder.mockList({ tableName: 'Tubes' }).returns().activate(500);
        airtableBuilder.mockList({ tableName: 'Acquis' }).returns().activate(500);
        airtableBuilder.mockList({ tableName: 'Epreuves' }).returns().activate(500);
        airtableBuilder.mockList({ tableName: 'Tests' }).returns().activate(500);
        airtableBuilder.mockList({ tableName: 'Tutoriels' }).returns().activate(500);

        const server = await createServer();

        // When
        const response = await server.inject({
          method: 'GET',
          url: '/api/current-content',
          headers: generateAuthorizationHeader(user),
        });

        // Then
        expect(() => JSON.parse(response.result)).to.throw(Error);
      });
    });
  });

  describe('GET /latest-release - Returns latest release', () => {
    context('nominal case', () => {
      let user;
      beforeEach(async function() {
        user = databaseBuilder.factory.buildAdminUser();
      });

      it('should return latest release of learning content', async () => {
        // Given
        const expectedLatestRelease = databaseBuilder.factory.buildRelease({ content: { areas: [], challenges: [], competences: [], courses: [], frameworks: [], skills: [], thematics: [], tubes: [], tutorials: [] } });
        const expectedContent = { areas: [], challenges: [], competences: [], courses: [], frameworks: [], skills: [], thematics: [], tubes: [], tutorials: [],
          'fr-fr': { areas: [], challenges: [], competences: [], courses: [], frameworks: [], skills: [], thematics: [], tubes: [], tutorials: [] },
          'en': { areas: [], challenges: [], competences: [], courses: [], frameworks: [], skills: [], thematics: [], tubes: [], tutorials: [] },
          'fr':{ areas: [], challenges: [], competences: [], courses: [], frameworks: [], skills: [], thematics: [], tubes: [], tutorials: [] } };
        await databaseBuilder.commit();

        const server = await createServer();

        // When
        const response = await server.inject({
          method: 'GET',
          url: '/api/releases/latest',
          headers: generateAuthorizationHeader(user),
        });

        // Then
        const latestRelease = JSON.parse(response.result);
        expect(latestRelease.content).to.deep.equal(expectedContent);
        expect(latestRelease.id).to.deep.equal(expectedLatestRelease.id);
        expect(latestRelease.date).to.deep.equal(expectedLatestRelease.date);
      });
    });
  });

  describe('POST /releases - Creates the release', () => {

    beforeEach(function() {
      sinon.stub(axios, 'post').resolves();
    });

    afterEach(function() {
      return knex('releases').delete();
    });

    context('nominal case', () => {
      it('should create the release', async () => {
        // Given
        const user = databaseBuilder.factory.buildAdminUser();
        const server = await createServer();
        await databaseBuilder.commit();
        const expectedCurrentContent = await mockContentForRelease();

        // When
        const response = await server.inject({
          method: 'POST',
          url: '/api/releases',
          headers: generateAuthorizationHeader(user),
        });

        // Then
        expect(response.statusCode).to.equal(200);
        const release = JSON.parse(response.result);
        expect(release.content).to.deep.equal(JSON.parse(JSON.stringify(expectedCurrentContent)));
      });
    });

    context('error case', async () => {
      it('should return a 403 when user is not allowed to create release', async () => {
        //given
        const user = databaseBuilder.factory.buildReadonlyUser();
        const server = await createServer();
        await databaseBuilder.commit();

        // When
        const response = await server.inject({
          method: 'POST',
          url: '/api/releases',
          headers: generateAuthorizationHeader(user),
        });

        // Then
        expect(response.statusCode).to.equal(403);
      });
    });
  });

  describe('GET /releases/:id - Returns given release', () => {
    let user;
    beforeEach(async function() {
      user = databaseBuilder.factory.buildAdminUser();
    });

    context('nominal case', () => {
      it('should return release specified by id', async () => {
        // Given
        const expectedRelease = databaseBuilder.factory.buildRelease({ id: 42, content: { areas: [], challenges: [], competences: [], courses: [], frameworks: [], skills: [], thematics: [], tubes: [], tutorials: [] }, createdAt: new Date('2021-01-01') });
        databaseBuilder.factory.buildRelease({ id: 43, content: { some: 'other-release' }, createdAt: new Date('2022-01-01') });

        const expectedContent = { areas: [], challenges: [], competences: [], courses: [], frameworks: [], skills: [], thematics: [], tubes: [], tutorials: [],
          'fr-fr': { areas: [], challenges: [], competences: [], courses: [], frameworks: [], skills: [], thematics: [], tubes: [], tutorials: [] },
          'en': { areas: [], challenges: [], competences: [], courses: [], frameworks: [], skills: [], thematics: [], tubes: [], tutorials: [] },
          'fr':{ areas: [], challenges: [], competences: [], courses: [], frameworks: [], skills: [], thematics: [], tubes: [], tutorials: [] } };

        await databaseBuilder.commit();

        const server = await createServer();

        // When
        const response = await server.inject({
          method: 'GET',
          url: '/api/releases/42',
          headers: generateAuthorizationHeader(user),
        });

        // Then
        expect(response.statusCode).to.equal(200);
        const release = JSON.parse(response.result);
        expect(release.content).to.deep.equal(expectedContent);
        expect(release.id).to.deep.equal(expectedRelease.id);
        expect(release.date).to.deep.equal(expectedRelease.date);
      });
    });

    context('error case', () => {
      it('should return a 404 when the release does not exist', async () => {
        // Given
        await databaseBuilder.commit();
        const server = await createServer();

        // When
        const response = await server.inject({
          method: 'GET',
          url: '/api/releases/42',
          headers: generateAuthorizationHeader(user),
        });

        // Then
        expect(response.statusCode).to.equal(404);
      });
    });
  });
});
