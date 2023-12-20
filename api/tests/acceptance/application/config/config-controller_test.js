import { beforeEach, describe, describe as context, expect, it, vi } from 'vitest';
import { databaseBuilder, generateAuthorizationHeader } from '../../../test-helper.js';
import { createServer } from '../../../../server.js';
import * as config from '../../../../lib/config.js';

describe('Acceptance | Controller | config', () => {

  describe('GET /config - retrieve config', () => {
    context('nominal case', () => {
      let user;
      beforeEach(async function() {
        user = databaseBuilder.factory.buildAdminUser();
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
        vi.spyOn(config, 'pixEditor', 'get').mockReturnValue({
          'airtableUrl': 'airtableUrlValue',
          'tableChallenges': 'tableChallengesValue',
          'tableSkills': 'tableSkillsValue',
          'tableTubes': 'tableTubesValue',
          'storagePost': 'storagePostValue',
          'storageBucket': 'storageBucketValue',
          'localeToLanguageMap': 'localeToLanguageMap',
          'tutorialLocaleToLanguageMap': 'tutorialLocaleToLanguageMap',
        });

        const expectedConfig = {
          data: {
            type: 'configs',
            attributes: {
              'airtable-url': 'airtableUrlValue',
              'table-challenges': 'tableChallengesValue',
              'table-skills': 'tableSkillsValue',
              'table-tubes': 'tableTubesValue',
              'storage-post': 'storagePostValue',
              'storage-bucket': 'storageBucketValue',
              'locale-to-language-map': 'localeToLanguageMap',
              'tutorial-locale-to-language-map': 'tutorialLocaleToLanguageMap',
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

