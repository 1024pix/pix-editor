const { expect, databaseBuilder, generateAuthorizationHeader } = require('../../../test-helper');
const createServer = require('../../../../server');

describe('Acceptance | Controller | config', () => {

  describe('GET /config - retrieve config', () => {
    context('nominal case', () => {
      let user;
      beforeEach(async function() {
        user = databaseBuilder.factory.buildUser({ name: 'User', trigram: 'ABC', access: 'admin', apiKey:'11b2cab8-050e-4165-8064-29a1e58d8997' });
        await databaseBuilder.commit();
      });

      it('should return 200', async () => {
        // Given
        const server = await createServer();
        const getConfigOptions = {
          method: 'GET',
          url: '/api/config',
          headers: generateAuthorizationHeader(user)
        };

        // When
        const response = await server.inject(getConfigOptions);

        // Then
        expect(response.statusCode).to.equal(200);
      });

      it('should return config', async () => {
        // Given
        const expectedConfig = {
          data: {
            type: 'configs',
            attributes: {
              'airtable-url': 'airtableUrlValue',
              'table-challenges': 'tableChallengesValue',
              'table-skills': 'tableSkillsValue',
              'table-tubes': 'tableTubesValue',
              'storage-post': 'storagePostValue',
              'storage-tenant': 'storageTenantValue',
              'storage-user': 'storageUserValue',
              'storage-password': 'storagePasswordValue',
              'storage-key': 'storageKeyValue',
              'storage-auth': 'storageAuthValue',
              'storage-bucket': 'storageBucketValue',
            },
          }
        };
        const server = await createServer();
        const getConfigOptions = {
          method: 'GET',
          url: '/api/config',
          headers: generateAuthorizationHeader(user)
        };

        // When
        const response = await server.inject(getConfigOptions);

        // Then
        expect(response.result).to.deep.equal(expectedConfig);
      });
    });

    context('errors', () => {
      it('should return 401 unauthorized when there is no authorization header', async() => {
        // Given
        const server = await createServer();
        const getConfigOptions = {
          method: 'GET',
          url: '/api/config'
        };

        // When
        const response = await server.inject(getConfigOptions);

        // Then
        expect(response.statusCode).to.equal(401);
      });
    });
  });

});

