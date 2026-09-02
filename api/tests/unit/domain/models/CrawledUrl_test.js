import { describe, expect, it } from 'vitest';
import { CrawledUrl } from '../../../../lib/domain/models/index.js';

describe('Unit | Domain | CrawledUrl', () => {
  describe('#isRepaired', () => {
    it('returns true if status code is successful-ish', () => {
      // given
      const okCrawledUrl = new CrawledUrl({ statusCode: 200 });
      const tooManyRedirectsCrawledUrl = new CrawledUrl({ statusCode: 303 });
      const notFoundCrawledUrl = new CrawledUrl({ statusCode: 404 });
      const serverErrorCrawledUrl = new CrawledUrl({ statusCode: 500 });

      // then
      expect(okCrawledUrl.isRepaired).toBe(true);
      expect(tooManyRedirectsCrawledUrl.isRepaired).toBe(true);
      expect(notFoundCrawledUrl.isRepaired).toBe(false);
      expect(serverErrorCrawledUrl.isRepaired).toBe(false);
    });
  });

  describe('#isBroken', () => {
    it('returns true if status code is error-ish', () => {
      // given
      const okCrawledUrl = new CrawledUrl({ statusCode: 200 });
      const tooManyRedirectsCrawledUrl = new CrawledUrl({ statusCode: 303 });
      const notFoundCrawledUrl = new CrawledUrl({ statusCode: 404 });
      const serverErrorCrawledUrl = new CrawledUrl({ statusCode: 500 });

      // then
      expect(okCrawledUrl.isBroken).toBe(false);
      expect(tooManyRedirectsCrawledUrl.isBroken).toBe(false);
      expect(notFoundCrawledUrl.isBroken).toBe(true);
      expect(serverErrorCrawledUrl.isBroken).toBe(true);
    });
  });
});
