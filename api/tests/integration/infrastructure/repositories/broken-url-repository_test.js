import { describe, expect, it } from 'vitest';
import { databaseBuilder, knex } from '../../../test-helper.js';
import { saveNewlyBrokenUrlList, removeRepairedUrlList, list } from '../../../../lib/infrastructure/repositories/broken-url-repository.js';

describe('Integration | Repository | broken-url-repository', () => {
  describe('#saveNewlyBrokenUrlList', () => {
    it('should add new broken URLs in the database', async () => {
      const newlyBrokenUrl1 = databaseBuilder.factory.buildBrokenUrl({ url: 'https://example.com/old-broken-link-1', statusCode: 400 });
      const newlyBrokenUrl2 = databaseBuilder.factory.buildBrokenUrl({ url: 'https://example.com/old-broken-link-2', statusCode: 404 });
      await databaseBuilder.commit();

      const newlyBrokenUrl3 = { url: 'https://example.com/new-broken-link-3', statusCode: 400 };
      const newlyBrokenUrl4 = { url: 'https://example.com/new-broken-link-4', statusCode: 404, errorMessage: 'URL pas trouvée' };

      await saveNewlyBrokenUrlList([newlyBrokenUrl3, newlyBrokenUrl4]);

      const updatedUrlList = await knex('broken_urls').select('*');

      expect(updatedUrlList).toEqual([
        newlyBrokenUrl1,
        newlyBrokenUrl2,
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

      const updatedUrlList = await knex('broken_urls').select('*');

      expect(updatedUrlList).toEqual([
        newlyBrokenUrl1,
        newlyBrokenUrl2,
        newlyBrokenUrl4,
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

      const updatedUrlList = await knex('broken_urls').select('*');

      expect(updatedUrlList).toEqual([oldBrokenUrl2]);
    });

    it('should not remove URLs from the database if the repaired URLs are not present', async function() {
      const oldBrokenUrl1 = databaseBuilder.factory.buildBrokenUrl({ url: 'https://example.com/old-broken-link-1', statusCode: 400 });
      const oldBrokenUrl2 = databaseBuilder.factory.buildBrokenUrl({ url: 'https://example.com/old-broken-link-2', statusCode: 404 });
      await databaseBuilder.commit();

      const repairedUrl = { url: 'https://example.com/new-broken-link-1', statusCode: 200 };

      await removeRepairedUrlList([repairedUrl]);

      const updatedUrlList = await knex('broken_urls').select('*');

      expect(updatedUrlList).toEqual([oldBrokenUrl1, oldBrokenUrl2]);
    });
  });

  describe('#list', () => {
    it('should retrieve broken url readmodels ordered by url', async () => {
      // given
      const newlyBrokenUrl1 = databaseBuilder.factory.buildBrokenUrl({ url: 'https://example.com/old-broken-link-1', statusCode: 400 });
      const newlyBrokenUrl2 = databaseBuilder.factory.buildBrokenUrl({ url: 'https://example.com/old-broken-link-2', statusCode: 404 });
      await databaseBuilder.commit();

      // when
      const brokenUrls = await list();

      // then
      expect(brokenUrls).toEqual([newlyBrokenUrl1, newlyBrokenUrl2]);
    });

    it('should return an empty array when no broken urls was found', async () => {
      // when
      const brokenUrls = await list();

      // then
      expect(brokenUrls).toEqual([]);
    });
  });
});

