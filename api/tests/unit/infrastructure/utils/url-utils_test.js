import { describe, expect, it } from 'vitest';
import * as UrlUtils from '../../../../lib/infrastructure/utils/url-utils.js';

describe('Unit | Utils | URL Utils', function() {
  describe('#findUrlsInMarkdown', function() {
    it('should return URLs in markdown text', function() {
      // given
      const markdownText = 'instructions [link](https://example.net/) further instructions [other_link](https://other_example.net/)';

      // when
      const urls = UrlUtils.findUrlsInMarkdown(markdownText);

      // then
      expect(urls).toStrictEqual([
        'https://example.net/',
        'https://other_example.net/',
      ]);
    });

    it('should return an empty array when no URL detected in markdown', function() {
      // given
      const markdownText1 = 'instructions [link](https://broke)further instructions';
      const markdownText2 = 'coucou';
      const markdownText3 = '';
      const markdownText4 = null;
      const markdownText5 = undefined;

      // when
      const urls1 = UrlUtils.findUrlsInMarkdown(markdownText1);
      const urls2 = UrlUtils.findUrlsInMarkdown(markdownText2);
      const urls3 = UrlUtils.findUrlsInMarkdown(markdownText3);
      const urls4 = UrlUtils.findUrlsInMarkdown(markdownText4);
      const urls5 = UrlUtils.findUrlsInMarkdown(markdownText5);

      // then
      expect(urls1).toStrictEqual([]);
      expect(urls2).toStrictEqual([]);
      expect(urls3).toStrictEqual([]);
      expect(urls4).toStrictEqual([]);
      expect(urls5).toStrictEqual([]);
    });

    it('should fix url by prepending protocol if missing', function() {
      // given
      const markdownText = 'instructions [link](www.example.net/)';

      // when
      const urls = UrlUtils.findUrlsInMarkdown(markdownText);

      // then
      expect(urls).toStrictEqual(['https://www.example.net/']);
    });

    it('should return unique occurences', function() {
      // given
      const markdownText = 'instructions [link](https://www.example.net/) further instructions [other_link](https://www.example.net/)';

      // when
      const urls = UrlUtils.findUrlsInMarkdown(markdownText);

      // then
      expect(urls).toStrictEqual(['https://www.example.net/']);
    });
  });
});
