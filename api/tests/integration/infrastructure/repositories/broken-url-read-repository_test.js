import { describe, expect, it } from 'vitest';
import { databaseBuilder } from '../../../test-helper.js';
import { list } from '../../../../lib/infrastructure/repositories/broken-url-read-repository.js';

describe('Integration | Repository | broken-url-read-repository', () => {
  describe('#list', () => {
    it('should retrieve broken url readmodels ordered by url', async () => {
      // given
      const newlyBrokenUrl1 = databaseBuilder.factory.buildBrokenUrl({ id: 1, url: 'https://example.com/old-broken-link-1', statusCode: 400 });
      const newlyBrokenUrl2 = databaseBuilder.factory.buildBrokenUrl({ id: 2, url: 'https://example.com/old-broken-link-2', statusCode: 404 });
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

