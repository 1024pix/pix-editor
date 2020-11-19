const { expect, airtableBuilder, databaseBuilder, generateAuthorizationHeader } = require('../../../test-helper');
const createServer = require('../../../../server');
const { buildArea, buildCompetence } = airtableBuilder.factory;

describe('Acceptance | Controller | release-controller', () => {

  describe('POST /releases - Create a release from current Airtable data', () => {
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
          }]
        };
        airtableBuilder.mockLists({
          areas: [buildArea(expectedCreatedRelease.areas[0])],
          competences: [buildCompetence(expectedCreatedRelease.competences[0])]
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
        expect(response.result).to.deep.equal(expectedCreatedRelease);
      });
    });
  });

});
