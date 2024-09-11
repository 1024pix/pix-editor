import { describe, expect, it } from 'vitest';
import * as UrlUtils from '../../../../lib/infrastructure/utils/url-utils.js';

describe('Unit | Utils | URL Utils', function() {
  describe('#findUrlsInMarkdown', function() {
    it('should return URLs in markdown text', function() {
      // given
      const markdownText = 'instructions [link](https://example.net/) further instructions [https://other_example.net?mode=a&lang=fr](https://other_example.net?mode=a&lang=fr) <a href="https://from_link_example.net?mode=a&lang=en">ici</a>';

      // when
      const urls = UrlUtils.findUrlsInMarkdown(markdownText);

      // then
      expect(urls).toStrictEqual([
        'https://example.net/',
        'https://other_example.net?mode=a&lang=fr',
        'https://from_link_example.net?mode=a&lang=en'
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
      const markdownText = 'instructions [link](www.example.net/) [second link](www.example.net/?url=https://example.com/path)';

      // when
      const urls = UrlUtils.findUrlsInMarkdown(markdownText);

      // then
      expect(urls).toStrictEqual([
        'https://www.example.net/',
        'https://www.example.net/?url=https://example.com/path',
      ]);
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

  describe('#getOrigin', () => {
    [
      { url: 'http://pix.fr', expected: 'http://pix.fr' },
      { url: 'https://pix.org', expected: 'https://pix.org' },
      { url: 'https://app.pix.org/le/chemin/index.html?toto=123&titi=456#qwerty', expected: 'https://app.pix.org' },
    ].forEach(({ url, expected }) => {
      describe(`when url is "${url}"`, () => {
        it(`should return "${expected}"`, () => {
          expect(UrlUtils.getOrigin(url)).toBe(expected);
        });
      });
    });
  });
});
