const { expect, airtableBuilder, databaseBuilder, generateAuthorizationHeader, catchErr } = require('../../../test-helper');
const createServer = require('../../../../server');
const {
  buildArea,
  buildCompetence,
  buildTube,
  buildSkill,
  buildChallenge,
  buildTutorial,
  buildCourse,
} = airtableBuilder.factory;

describe('Acceptance | Controller | release-controller', () => {

  describe('GET /releases/latest - Returns release from current Airtable data', () => {
    context('nominal case', () => {
      let user;
      beforeEach(async function() {
        user = databaseBuilder.factory.buildUser({ name: 'User', trigram: 'ABC', access: 'admin', apiKey: '11b2cab8-050e-4165-8064-29a1e58d8997' });
        await databaseBuilder.commit();
      });

      it('should return latest learning content release', async () => {
        // Given
        const expectedCreatedRelease = {
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
          }],
          challenges: [{
            id: 'recChallenge0',
            instruction: 'Consigne du Challenge',
            proposals: 'Propositions du Challenge',
            type: 'Type d\'épreuve',
            solution: 'Bonnes réponses du Challenge',
            t1Status: 'T1 - Espaces, casse & accents',
            t2Status: 'T2 - Ponctuation',
            t3Status: 'T3 - Distance d\'édition',
            scoring: 'Scoring du Challenge',
            status: 'Statut du Challenge',
            skillIds: ['recSkill0'],
            skills: ['recSkill0'],
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
        };
        airtableBuilder.mockLists({
          areas: [buildArea(expectedCreatedRelease.areas[0])],
          competences: [buildCompetence(expectedCreatedRelease.competences[0])],
          tubes: [buildTube(expectedCreatedRelease.tubes[0])],
          skills: [buildSkill(expectedCreatedRelease.skills[0])],
          challenges: [buildChallenge(expectedCreatedRelease.challenges[0])],
          tutorials: [buildTutorial(expectedCreatedRelease.tutorials[0])],
          courses: [buildCourse(expectedCreatedRelease.courses[0])],
        });

        const server = await createServer();
        const latestReleaseOptions = {
          method: 'GET',
          url: '/api/releases/latest',
          headers: generateAuthorizationHeader(user),
        };

        // When
        const response = await server.inject(latestReleaseOptions);

        // Then
        expect(JSON.parse(response.result)).to.deep.equal(expectedCreatedRelease);
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
        const latestReleaseOptions = {
          method: 'GET',
          url: '/api/releases/latest',
          headers: generateAuthorizationHeader(user),
        };
        
        // When
        const response = await server.inject(latestReleaseOptions);
        
        // Then
        expect(() => JSON.parse(response.result)).to.throw(Error);
      });
    });
  });

});
