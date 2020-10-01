const { expect, airtableBuilder, databaseBuilder, generateAuthorizationHeader } = require('../../../test-helper');
const createServer = require('../../../../server');
const { buildArea } = airtableBuilder.factory;

describe('Acceptance | Controller | area-controller', () => {

  describe('GET /areas - retrieve "Domaines" (Areas) from airtable', () => {
    context('nominal case', () => {
      let user;
      beforeEach(async function() {
        user = databaseBuilder.factory.buildUser({ name: 'User', trigram: 'ABC', access: 'admin', apiKey:'11b2cab8-050e-4165-8064-29a1e58d8997' });
        await databaseBuilder.commit();
        airtableBuilder
          .mockList({ tableName: 'Domaines' })
          .returns([
            buildArea({ id: '1', nom: 'Nom du domaine 1', code: '1', competenceIds: ['recCompetence1', 'recCompetence2'] }),
            buildArea({ id: '2', nom: 'Nom du domaine 2', code: '2', competenceIds: ['recCompetence3', 'recCompetence4'] })
          ])
          .activate();
      });

      afterEach(function() {
        airtableBuilder.cleanAll();
      });

      it('should return 200', async () => {
        // Given
        const server = await createServer();
        const getAreasOptions = {
          method: 'GET',
          url: '/api/areas',
          headers: generateAuthorizationHeader(user)
        };

        // When
        const response = await server.inject(getAreasOptions);

        // Then
        expect(response.statusCode).to.equal(200);
      });

      it('should return areas', async () => {
        // Given
        const expectedAreas = {
          data: [{
            type: 'areas',
            id: '1',
            attributes: {
              'name': 'Nom du domaine 1',
              'code': '1',
            },
            relationships: {
              'competences': {
                data: [
                  { id: 'recCompetence1', type: 'competences' },
                  { id: 'recCompetence2', type: 'competences' },
                ]
              },
            }
          }, {
            type: 'areas',
            id: '2',
            attributes: {
              'name': 'Nom du domaine 2',
              'code': '2',
            },
            relationships: {
              'competences': {
                data: [
                  { id: 'recCompetence3', type: 'competences' },
                  { id: 'recCompetence4', type: 'competences' },
                ]
              },
            }
          }]
        };
        const server = await createServer();
        const getAreasOptions = {
          method: 'GET',
          url: '/api/areas',
          headers: generateAuthorizationHeader(user)
        };

        // When
        const response = await server.inject(getAreasOptions);

        // Then
        expect(response.result).to.deep.equal(expectedAreas);
      });
    });

    context('errors', () => {
      it('should return 401 unauthorized when there is no authorization header', async() => {
        // Given
        const server = await createServer();
        const getAreasOptions = {
          method: 'GET',
          url: '/api/areas'
        };

        // When
        const response = await server.inject(getAreasOptions);

        // Then
        expect(response.statusCode).to.equal(401);
      });
    });
  });

});

