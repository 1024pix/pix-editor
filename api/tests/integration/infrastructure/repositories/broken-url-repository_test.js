import { describe, expect, it } from 'vitest';
import { databaseBuilder, knex } from '../../../test-helper.js';
import { saveNewlyBrokenUrlList, removeRepairedUrlList, deleteUnmentionedBrokenUrls, list } from '../../../../lib/infrastructure/repositories/broken-url-repository.js';
import { BrokenUrl } from '../../../../lib/domain/readmodels/index.js';

describe('Integration | Repository | broken-url-repository', () => {
  describe('#saveNewlyBrokenUrlList', () => {
    it('should add new broken URLs in the database', async () => {
      const newlyBrokenUrl1 = databaseBuilder.factory.buildBrokenUrl({ url: 'https://example.com/old-broken-link-1', statusCode: 400 });
      const newlyBrokenUrl2 = databaseBuilder.factory.buildBrokenUrl({ url: 'https://example.com/old-broken-link-2', statusCode: 404 });
      await databaseBuilder.commit();

      const newlyBrokenUrl3 = { url: 'https://example.com/new-broken-link-3', statusCode: 400 };
      const newlyBrokenUrl4 = { url: 'https://example.com/new-broken-link-4', statusCode: 404, errorMessage: 'URL pas trouvée' };

      await saveNewlyBrokenUrlList([newlyBrokenUrl3, newlyBrokenUrl4]);

      const updatedUrlList = await knex('broken_urls').select('url', 'errorMessage', 'statusCode');

      expect(updatedUrlList).toEqual([
        {
          errorMessage: newlyBrokenUrl1.errorMessage,
          statusCode: newlyBrokenUrl1.statusCode,
          url: newlyBrokenUrl1.url,
        },
        {
          errorMessage: newlyBrokenUrl2.errorMessage,
          statusCode: newlyBrokenUrl2.statusCode,
          url: newlyBrokenUrl2.url,
        },
        {
          ...newlyBrokenUrl3,
          errorMessage: null,
        },
        {
          ...newlyBrokenUrl4,
          errorMessage: 'URL pas trouvée',
        },
      ]);
    });

    it('should not add an already present broken URLs in the database', async () => {
      const newlyBrokenUrl1 = databaseBuilder.factory.buildBrokenUrl({ url: 'https://example.com/old-broken-link-1', statusCode: 400 });
      const newlyBrokenUrl2 = databaseBuilder.factory.buildBrokenUrl({ url: 'https://example.com/old-broken-link-2', statusCode: 404 });
      await databaseBuilder.commit();

      const oldBrokenUrl3 = { url: 'https://example.com/old-broken-link-1', statusCode: 400 };
      const newlyBrokenUrl4 = { url: 'https://example.com/new-broken-link-4', statusCode: 404, errorMessage: 'URL pas trouvée' };

      await saveNewlyBrokenUrlList([oldBrokenUrl3, newlyBrokenUrl4]);

      const updatedUrlList = await knex('broken_urls').select('url', 'errorMessage', 'statusCode');

      expect(updatedUrlList).toEqual([
        {
          errorMessage: newlyBrokenUrl1.errorMessage,
          statusCode: newlyBrokenUrl1.statusCode,
          url: newlyBrokenUrl1.url,
        },
        {
          errorMessage: newlyBrokenUrl2.errorMessage,
          statusCode: newlyBrokenUrl2.statusCode,
          url: newlyBrokenUrl2.url,
        },
        {
          errorMessage: newlyBrokenUrl4.errorMessage,
          statusCode: newlyBrokenUrl4.statusCode,
          url: newlyBrokenUrl4.url,
        },
      ]);
    });
  });

  describe('#removeRepairedUrlList', () => {
    it('should remove urls from the broken url table', async function() {
      databaseBuilder.factory.buildBrokenUrl({ url: 'https://example.com/old-broken-link-1', statusCode: 400 });
      const oldBrokenUrl2 = databaseBuilder.factory.buildBrokenUrl({ url: 'https://example.com/old-broken-link-2', statusCode: 404 });
      await databaseBuilder.commit();

      const repairedUrl = { url: 'https://example.com/old-broken-link-1', statusCode: 200 };

      await removeRepairedUrlList([repairedUrl]);

      const updatedUrlList = await knex('broken_urls').select('url', 'errorMessage', 'statusCode');

      expect(updatedUrlList).toEqual([
        {
          errorMessage: oldBrokenUrl2.errorMessage,
          statusCode: oldBrokenUrl2.statusCode,
          url: oldBrokenUrl2.url,
        },
      ]);
    });

    it('should not remove URLs from the database if the repaired URLs are not present', async function() {
      const oldBrokenUrl1 = databaseBuilder.factory.buildBrokenUrl({ url: 'https://example.com/old-broken-link-1', statusCode: 400 });
      const oldBrokenUrl2 = databaseBuilder.factory.buildBrokenUrl({ url: 'https://example.com/old-broken-link-2', statusCode: 404 });
      await databaseBuilder.commit();

      const repairedUrl = { url: 'https://example.com/new-broken-link-1', statusCode: 200 };

      await removeRepairedUrlList([repairedUrl]);

      const updatedUrlList = await knex('broken_urls').select('url', 'errorMessage', 'statusCode');

      expect(updatedUrlList).toEqual([
        {
          errorMessage: oldBrokenUrl1.errorMessage,
          statusCode: oldBrokenUrl1.statusCode,
          url: oldBrokenUrl1.url,
        },
        {
          errorMessage: oldBrokenUrl2.errorMessage,
          statusCode: oldBrokenUrl2.statusCode,
          url: oldBrokenUrl2.url,
        },
      ]);
    });
  });

  describe('#deleteUnmentionedBrokenUrls', () => {
    it('should remove urls from the broken url table if they are not mentioned anymore in external urls', async function() {
      const externalUrl1 = databaseBuilder.factory.buildExternalUrl({ url: 'https://example.com/broken-link-1', localizedChallengeIds: [], tutorialIds: [] });
      const brokenLink1 = databaseBuilder.factory.buildBrokenUrl({ url: externalUrl1.url, statusCode: 400 });

      const externalUrl2 = databaseBuilder.factory.buildExternalUrl({ url: 'https://example.com/broken-link-2', localizedChallengeIds: [], tutorialIds: [] });
      const brokenLink2 = databaseBuilder.factory.buildBrokenUrl({ url: externalUrl2.url, statusCode: 404 });

      databaseBuilder.factory.buildBrokenUrl({ url: 'https://example.com/unmentioned-tutorial-link', statusCode: 404 });

      await databaseBuilder.commit();

      await deleteUnmentionedBrokenUrls();

      const updatedUrlList = await knex('broken_urls').select('url', 'errorMessage', 'statusCode');

      expect(updatedUrlList).toStrictEqual([
        {
          errorMessage: brokenLink1.errorMessage,
          statusCode: brokenLink1.statusCode,
          url: brokenLink1.url,
        },
        {
          errorMessage: brokenLink2.errorMessage,
          statusCode: brokenLink2.statusCode,
          url: brokenLink2.url,
        },
      ]);
    });
  });

  describe('#list', () => {
    it('should retrieve broken url readmodels ordered by url', async () => {
      // given
      const notFoundUrl = databaseBuilder.factory.buildBrokenUrl({
        errorMessage: 'Not Found',
        statusCode: 404,
        url: 'http://localhost:8080/',
      });
      const brokenUrl = databaseBuilder.factory.buildBrokenUrl({
        errorMessage: 'Tout cassé',
        statusCode: 500,
        url: 'http://test.localhost:8080/',
      });
      const notAllowedUrl = databaseBuilder.factory.buildBrokenUrl({
        errorMessage: 'Pas le droit',
        statusCode: 401,
        url: 'http://www.test.org',
      });
      await databaseBuilder.commit();

      // when
      const brokenUrlList = await list();

      // then
      expect(brokenUrlList[0]).toBeInstanceOf(BrokenUrl);

      expect(brokenUrlList).toEqual([
        notFoundUrl,
        brokenUrl,
        notAllowedUrl,
      ]);
    });

    it('should return an empty array when no broken urls was found', async () => {
      // when
      const brokenUrls = await list();

      // then
      expect(brokenUrls).toEqual([]);
    });
  });
});
