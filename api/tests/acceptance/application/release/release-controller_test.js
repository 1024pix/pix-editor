const { expect, domainBuilder, airtableBuilder } = require('../../../test-helper');
const createServer = require('../../../../server');

describe('Acceptance | Controller | release-controller', () => {
  beforeEach(() => {
    airtableBuilder
      .mockList({ tableName: 'Domaines' })
      .returns([airtableBuilder.factory.buildArea()])
      .activate();
    airtableBuilder
      .mockList({ tableName: 'Competences' })
      .returns([airtableBuilder.factory.buildCompetence({ acquisViaTubes: [] })])
      .activate();
  });

  describe('POST /releases - Create a release from current Airtable data', () => {
    context('nominal case', () => {
      it('should return 201', async () => {
        // Given
        const server = await createServer();
        const createReleaseOptions = {
          method: 'POST',
          url: '/api/releases'
        };

        // When
        const response = await server.inject(createReleaseOptions);

        // Then
        expect(response.statusCode).to.equal(201);
      });

      it('should return created release', async () => {
        // Given
        const server = await createServer();
        const createReleaseOptions = {
          method: 'POST',
          url: '/api/releases'
        };
        const expectedCreatedRelease = {
          id: '2020-03-02:fr',
          content: domainBuilder.buildRelease()
        };

        // When
        const response = await server.inject(createReleaseOptions);

        // Then
        expect(response.result).to.deep.equal(expectedCreatedRelease);
      });
    });
  });

});
