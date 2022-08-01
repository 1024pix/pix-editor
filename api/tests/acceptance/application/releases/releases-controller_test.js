const { expect, domainBuilder, airtableBuilder, databaseBuilder, generateAuthorizationHeader, sinon, knex } = require('../../../test-helper');
const createServer = require('../../../../server');
const axios = require('axios');
const Training = require('../../../../lib/domain/models/Training');

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

  databaseBuilder.factory.buildTraining({
    id: 1000,
    title: 'Travail de groupe et collaboration entre les personnels',
    link: 'https://magistere.education.fr/ac-normandie/enrol/index.php?id=5924',
    type: 'autoformation',
    duration: '06:00:00',
    locale: 'fr-fr',
    targetProfileIds: [1822, 2214],
  });
  await databaseBuilder.commit();

  const training = await knex('trainings').first();

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
    trainings: [new Training(training)]
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
    challenges: [buildChallenge(domainBuilder.buildChallenge(expectedCurrentContent.challenges[0]))],
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
        const expectedLatestRelease = databaseBuilder.factory.buildRelease({ content: { areas: [], challenges: [], competences: [], courses: [], frameworks: [], skills: [], thematics: [], tubes: [], tutorials: [], trainings: [] } });
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
        expect(latestRelease.content).to.deep.equal(expectedLatestRelease.content);
        expect(latestRelease.id).to.deep.equal(expectedLatestRelease.id);
        expect(latestRelease.date).to.deep.equal(expectedLatestRelease.date);
      });
    });
  });

  describe('POST /releases - Creates the release', () => {

    beforeEach(function() {
      sinon.stub(axios, 'post').resolves();
    });

    context('nominal case', () => {
      it('should create the release', async () => {
        // Given
        const user = databaseBuilder.factory.buildAdminUser();
        const server = await createServer();
        await databaseBuilder.commit();
        const expectedCurrentContent = await mockCurrentContent();

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
        const expectedRelease = databaseBuilder.factory.buildRelease({ id: 42, content: { areas: [], challenges: [], competences: [], courses: [], frameworks: [], skills: [], thematics: [], tubes: [], tutorials: [], trainings: [] }, createdAt: new Date('2021-01-01') });
        databaseBuilder.factory.buildRelease({ id: 43, content: { some: 'other-release' }, createdAt: new Date('2022-01-01') });
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
        expect(release.content).to.deep.equal(expectedRelease.content);
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
