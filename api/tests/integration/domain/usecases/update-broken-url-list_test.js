import { describe, expect, it } from 'vitest';
import { databaseBuilder, knex } from '../../../test-helper.js';
import { updateBrokenUrlList } from '../../../../lib/domain/usecases/index.js';

describe('Integration | Domain | Usecases | Update broken links', function() {
  describe('#updateBrokenUrlList', function() {
    it('should add broken links and remove repaired urls', async function() {
      // given
      const oldBrokenUrl1 = databaseBuilder.factory.buildBrokenUrl({
        id: 1,
        url: 'https://example.com/old-broken-link-1',
        statusCode: 400,
      });
      databaseBuilder.factory.buildBrokenUrl({
        id: 2,
        url: 'https://example.com/old-broken-link-2',
        statusCode: 404,
      });
      await databaseBuilder.commit();

      // when
      const crawledLinks = [
        { url: 'https://example.com/link-1', statusCode: 200 },
        { url: 'https://example.com/link-2', statusCode: 200 },
        { url: 'https://example.com/link-3', statusCode: 200 },
        { url: 'https://example.com/new-broken-link-1', statusCode: 404 },
        { url: 'https://example.com/old-broken-link-2', statusCode: 200 },
      ];
      await updateBrokenUrlList(crawledLinks);

      // then
      const brokenUrls = await knex('broken_urls');
      expect(brokenUrls).toStrictEqual([
        oldBrokenUrl1,
        {
          id: expect.any(Number),
          errorMessage: null,
          statusCode: 404,
          url: 'https://example.com/new-broken-link-1',
        },
      ]);
    });

    it('should add broken links if no link has been repaired', async function() {
      // given
      const oldBrokenUrl1 = databaseBuilder.factory.buildBrokenUrl({
        id: 3,
        url: 'https://example.com/old-broken-link-1',
        statusCode: 400,
      });
      const oldBrokenUrl2 = databaseBuilder.factory.buildBrokenUrl({
        id: 4,
        url: 'https://example.com/old-broken-link-2',
        statusCode: 404,
      });
      await databaseBuilder.commit();

      // when
      const crawledLinks = [
        { url: 'https://example.com/link-1', statusCode: 200 },
        { url: 'https://example.com/link-2', statusCode: 200 },
        { url: 'https://example.com/link-3', statusCode: 200 },
        { url: 'https://example.com/new-broken-link-1', statusCode: 404 },
      ];
      await updateBrokenUrlList(crawledLinks);

      // then
      const brokenUrls = await knex('broken_urls');
      expect(brokenUrls).toStrictEqual([
        {
          id: expect.any(Number),
          ...oldBrokenUrl1,
        },
        {
          id: expect.any(Number),
          ...oldBrokenUrl2,
        },
        {
          id: expect.any(Number),
          errorMessage: null,
          statusCode: 404,
          url: 'https://example.com/new-broken-link-1',
        },
      ]);
    });

    it('should not add broken links if no link has been broken', async function() {
      // given
      const oldBrokenUrl1 = databaseBuilder.factory.buildBrokenUrl({
        id: 5,
        url: 'https://example.com/old-broken-link-1',
        statusCode: 400,
      });
      const oldBrokenUrl2 = databaseBuilder.factory.buildBrokenUrl({
        id: 6,
        url: 'https://example.com/old-broken-link-2',
        statusCode: 404,
      });
      await databaseBuilder.commit();

      // when
      const crawledLinks = [
        { url: 'https://example.com/link-1', statusCode: 200 },
        { url: 'https://example.com/link-2', statusCode: 200 },
        { url: 'https://example.com/link-3', statusCode: 200 },
      ];
      await updateBrokenUrlList(crawledLinks);

      // then
      const brokenUrls = await knex('broken_urls');
      expect(brokenUrls).toStrictEqual([
        {
          id: expect.any(Number),
          ...oldBrokenUrl1,
        },
        {
          id: expect.any(Number),
          ...oldBrokenUrl2,
        },
      ]);
    });
  });
});
