import { expect, databaseBuilder, generateAuthorizationHeader } from '../../test-helper';
import createServer from '../../../server';

describe('Acceptance | Controller | translations-controller', () => {

  describe('GET /translations.csv - export all translations in CSV file', () => {

    it('should return a csv file', async () => {
      // Given
      const user = databaseBuilder.factory.buildAdminUser();
      databaseBuilder.factory.buildTranslation({
        key: 'some-key',
        locale: 'fr-fr',
        value: 'La clé !'
      });
      await databaseBuilder.commit();

      const server = await createServer();
      const getTranslationsOptions = {
        method: 'GET',
        url: '/api/translations.csv',
        headers: generateAuthorizationHeader(user)
      };

      // When
      const response = await server.inject(getTranslationsOptions);

      // Then
      expect(response.statusCode).to.equal(200);
    });

  });

});

