import { afterEach, describe, expect, it } from 'vitest';
import FormData from 'form-data';
import { databaseBuilder, generateAuthorizationHeader, knex } from '../../test-helper';
import { createServer } from '../../../server';

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
      databaseBuilder.factory.buildTranslation({
        key: 'some-key',
        locale: 'fr',
        value: 'La clé de la France !'
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
      expect(response.headers['content-type']).to.equal('text/csv; charset=utf-8');
      expect(response.payload).to.equal('key,fr\nsome-key,La clé de la France !');
    });

  });

  describe('PATCH /translations.csv - import translations from a CSV file', () => {

    afterEach(async() => {
      await knex('translations').delete();
    });

    it('should update the translations', async () => {
      // Given
      const user = databaseBuilder.factory.buildAdminUser();
      databaseBuilder.factory.buildTranslation({
        key: 'some-key',
        locale: 'fr-fr',
        value: 'La clé !'
      });
      await databaseBuilder.commit();
      const formData = new FormData();
      formData.append('file', 'key,locale,value\nsome-key,fr-fr,plop', 'test.csv');

      const server = await createServer();
      const putTranslationsOptions = {
        method: 'PATCH',
        url: '/api/translations.csv',
        headers: {
          ...generateAuthorizationHeader(user),
          ...formData.getHeaders(),
        },
        payload: formData.getBuffer()
      };

      // When
      const response = await server.inject(putTranslationsOptions);

      // Then
      expect(response.statusCode).to.equal(204);

      expect(await knex('translations').count()).to.deep.equal([{ count: 1 }]);
      expect(await knex('translations').where({ key: 'some-key' }).select('value').first()).to.deep.equal({ value: 'plop' });
    });

    it('should fail when the file is not a CSV', async () => {
      // Given
      const user = databaseBuilder.factory.buildAdminUser();
      databaseBuilder.factory.buildTranslation({
        key: 'some-key',
        locale: 'fr-fr',
        value: 'La clé !'
      });
      await databaseBuilder.commit();
      const formData = new FormData();
      formData.append('file', 'Helloworld', 'test.json');

      const server = await createServer();
      const putTranslationsOptions = {
        method: 'PATCH',
        url: '/api/translations.csv',
        headers: {
          ...generateAuthorizationHeader(user),
          ...formData.getHeaders(),
        },
        payload: formData.getBuffer()
      };

      // When
      const response = await server.inject(putTranslationsOptions);

      // Then
      expect(response.statusCode).to.equal(400);
    });

    it('should fail when there are more than one file', async () => {
      // Given
      const user = databaseBuilder.factory.buildAdminUser();
      databaseBuilder.factory.buildTranslation({
        key: 'some-key',
        locale: 'fr-fr',
        value: 'La clé !'
      });
      await databaseBuilder.commit();
      const formData = new FormData();
      formData.append('file', 'key,locale,value\nsome-key,fr-fr,plop', 'test1.csv');
      formData.append('file', 'key,locale,value\nsome-key2,fr-fr,plop again', 'test2.csv');

      const server = await createServer();
      const putTranslationsOptions = {
        method: 'PATCH',
        url: '/api/translations.csv',
        headers: {
          ...generateAuthorizationHeader(user),
          ...formData.getHeaders(),
        },
        payload: formData.getBuffer()
      };

      // When
      const response = await server.inject(putTranslationsOptions);

      // Then
      expect(response.statusCode).to.equal(400);
    });

    it('should return 4xx when there is no file', async () => {
      // Given
      const user = databaseBuilder.factory.buildAdminUser();
      await databaseBuilder.commit();
      const formData = new FormData();

      const server = await createServer();
      const putTranslationsOptions = {
        method: 'PATCH',
        url: '/api/translations.csv',
        headers: {
          ...generateAuthorizationHeader(user),
          ...formData.getHeaders(),
        },
        payload: formData.getBuffer()
      };

      // When
      const response = await server.inject(putTranslationsOptions);

      // Then
      expect(response.statusCode).to.equal(400);
    });

    it('should not import parts with a name different than file', async () => {
      // Given
      const user = databaseBuilder.factory.buildAdminUser();
      await databaseBuilder.commit();
      const formData = new FormData();
      formData.append('file', 'key,locale,value\nsome-key,fr-fr,plop', 'test.csv');
      formData.append('not-file', 'key,locale,value\nsome-other-key,fr-fr,plop', 'test.csv');

      const server = await createServer();
      const putTranslationsOptions = {
        method: 'PATCH',
        url: '/api/translations.csv',
        headers: {
          ...generateAuthorizationHeader(user),
          ...formData.getHeaders(),
        },
        payload: formData.getBuffer()
      };

      // When
      const response = await server.inject(putTranslationsOptions);

      // Then
      expect(response.statusCode).to.equal(204);

      expect(await knex('translations').count()).to.deep.equal([{ count: 1 }]);
      expect(await knex('translations').where({ key: 'some-key' }).select('value').first()).to.deep.equal({ value: 'plop' });
    });

  });
});
