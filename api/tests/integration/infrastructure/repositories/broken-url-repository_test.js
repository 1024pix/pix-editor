import { describe, expect, it } from 'vitest';
import { databaseBuilder, knex } from '../../../test-helper.js';
import { removeRepairedUrlList, saveNewlyBrokenUrlList } from '../../../../lib/infrastructure/repositories/broken-url-repository.js';

describe('Integration | Repository | broken-url-repository', () => {
  describe('#removeRepairedUrlList', () => {
    it('remove a list of repaired links', async function() {
      // given
      const repairedUrl = databaseBuilder.factory.buildBrokenUrl({ url: 'https://example.com/not-broken-anymore' });
      await databaseBuilder.commit();

      // when
      await removeRepairedUrlList([repairedUrl.url, 'https://example.com/new-working']);

      // then
      const brokenUrlList = await knex('broken_urls').select('*');
      expect(brokenUrlList).toHaveLength(0);
    });
  });

  describe('#saveNewlyBrokenUrlList', () => {
    it('add a list of newly broken links', async function() {
      // given
      const unrelatedBrokenUrl = databaseBuilder.factory.buildBrokenUrl({ url: 'https://example.com/broken-but-in-another-monitor' });
      const duplicateBrokenUrl = databaseBuilder.factory.buildBrokenUrl({ url: 'https://example.com/broken-duplicate' });
      await databaseBuilder.commit();

      const newlyBrokenUrlList = [
        {
          url: unrelatedBrokenUrl.url,
          statusCode: 401,
          errorMessage: null,
        },
        {
          url: duplicateBrokenUrl.url,
          statusCode: 401,
          errorMessage: null,
        },
        {
          url: 'https://example.com/not-working',
          statusCode: 500,
          errorMessage: null,
        },
        {
          url: 'https://example.com/fatal-error',
          statusCode: 400,
          errorMessage: 'UNREACHABLE dns whatever',
        },
      ];

      // when
      await saveNewlyBrokenUrlList(newlyBrokenUrlList);

      // then
      const brokenUrlList = await knex('broken_urls').select('*').orderBy('url');
      expect(brokenUrlList).toStrictEqual([
        unrelatedBrokenUrl,
        duplicateBrokenUrl,
        {
          url: 'https://example.com/fatal-error',
          statusCode: 400,
          errorMessage: 'UNREACHABLE dns whatever',
        },
        {
          url: 'https://example.com/not-working',
          statusCode: 500,
          errorMessage: null,
        },
      ]);
    });
  });
});

