const { expect, domainBuilder, airtableBuilder, databaseBuilder, generateAuthorizationHeader, sinon } = require('../../../test-helper');
const createServer = require('../../../../server');
const axios = require('axios');

const {
  buildArea,
  buildCompetence,
  buildTube,
  buildSkill,
  buildChallenge,
  buildTutorial,
  buildCourse,
  buildAttachment,
  buildThematic,
} = airtableBuilder.factory;

function mockCurrentContent() {
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
      description: 'Description de la compétence',
      descriptionFrFr: 'Description de la compétence - fr',
      descriptionEnUs: 'Description de la compétence - en',
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
      skillIds: ['recSkill0'],
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
      name: 'Name',
      competenceId: 'recCompetence0',
      tubeIds: ['recTube'],
      index: 0
    }]
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
    competences: [buildCompetence(expectedCurrentContent.competences[0])],
    tubes: [buildTube(expectedCurrentContent.tubes[0])],
    skills: [buildSkill(expectedCurrentContent.skills[0])],
    challenges: [buildChallenge(domainBuilder.buildChallenge(expectedCurrentContent.challenges[0]))],
    tutorials: [buildTutorial(expectedCurrentContent.tutorials[0])],
    courses: [buildCourse(expectedCurrentContent.courses[0])],
    attachments: attachments.map(buildAttachment),
    thematics: expectedCurrentContent.thematics.map(buildThematic),
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
        const expectedCurrentContent = mockCurrentContent();

        const server = await createServer();
        const currentContentOptions = {
          method: 'GET',
          url: '/api/current-content',
          headers: generateAuthorizationHeader(user),
        };

        // When
        const response = await server.inject(currentContentOptions);

        // Then
        expect(JSON.parse(response.result)).to.deep.equal(expectedCurrentContent);
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
        const expectedLatestRelease = databaseBuilder.factory.buildRelease({ content: { areas: [], challenges: [], competences: [], courses: [], skills: [], thematics: [], tubes: [], tutorials: [] } });
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
        const expectedCurrentContent = mockCurrentContent();

        // When
        const response = await server.inject({
          method: 'POST',
          url: '/api/releases',
          headers: generateAuthorizationHeader(user),
        });

        // Then
        expect(response.statusCode).to.equal(200);
        const release = JSON.parse(response.result);
        expect(release.content).to.deep.equal(expectedCurrentContent);
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
        const expectedRelease = databaseBuilder.factory.buildRelease({ id: 42, content: { areas: [], challenges: [], competences: [], courses: [], skills: [], thematics: [], tubes: [], tutorials: [] }, createdAt: new Date('2021-01-01') });
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
