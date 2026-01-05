import { describe, expect, it, vi } from 'vitest';
import { Tutorial } from '../../../../lib/domain/models/index.js';

describe('Unit | Domain | Tutorial', () => {
  describe('#get isYoutubeVideoLink', () => {
    it('is true when tutorial’s link references a Youtube video', () => {
      // given
      const youtubeVideoLinks = [
        'https://youtu.be/youtubecom1videoId',
        'https://youtu.be/youtubecom2videoId?t=123',
        'https://www.youtube.com/watch?v=youtubecom1videoId',
        'youtube.com/watch?v=youtubecom2videoId&t=666s',
        'https://youtube.com/watch?v=youtubecom3videoId&start=333',
        'www.youtube.com/watch?v=youtubecom4videoId&start=333&end=666',
        'https://www.youtube-nocookie.com/embed/youtubenocookie1videoId',
        'https://www.youtube-nocookie.com/embed/youtubenocookie3videoId?start=123',
        'https://www.youtube-nocookie.com/embed/youtubenocookie3videoId?start=123&end=456',
      ];

      // when
      const tutorials = youtubeVideoLinks.map((link) => new Tutorial({ link }));

      // then
      tutorials.forEach((tutorial) => expect(tutorial).toHaveProperty('isYoutubeVideoLink', true));
    });

    it('is false when tutorial’s link doesn’t reference a Youtube video', () => {
      // given
      const nonYoutubeVideoLinks = [
        'https://test.youtube.com/watch?v=nop',
        'https://example.com/embed/pouet',
        'https://app.pix.fr/youtube-video.html?v=test&start=123',
      ];

      // when
      const tutorials = nonYoutubeVideoLinks.map((link) => new Tutorial({ link }));

      // then
      tutorials.forEach((tutorial) => expect(tutorial).toHaveProperty('isYoutubeVideoLink', false));
    });
  });

  describe('#rewriteYoutubeVideoLink', () => {
    it('rewrites Youtube video links when possible', () => {
      // given
      const links = [
        { given: 'https://test.youtube.com/watch?v=nop', expected: 'https://test.youtube.com/watch?v=nop' },
        { given: 'https://example.com/embed/pouet', expected: 'https://example.com/embed/pouet' },
        { given: 'https://youtu.be/youtubecom1videoId', expected: 'https://app.pix.fr/youtube-video.html?v=youtubecom1videoId' },
        { given: 'https://youtu.be/youtubecom2videoId?t=123', expected: 'https://app.pix.fr/youtube-video.html?v=youtubecom2videoId&start=123' },
        { given: 'https://www.youtube.com/watch?v=youtubecom1videoId', expected: 'https://app.pix.fr/youtube-video.html?v=youtubecom1videoId' },
        { given: 'https://www.youtube.com/watch?t=789', expected: 'https://www.youtube.com/watch?t=789' },
        { given: 'youtube.com/watch?v=youtubecom2videoId&t=666s', expected: 'https://app.pix.fr/youtube-video.html?v=youtubecom2videoId&start=666s' },
        { given: 'https://youtube.com/watch?v=youtubecom3videoId&start=333', expected: 'https://app.pix.fr/youtube-video.html?v=youtubecom3videoId&start=333' },
        { given: 'www.youtube.com/watch?v=youtubecom4videoId&start=333&end=666', expected: 'https://app.pix.fr/youtube-video.html?v=youtubecom4videoId&start=333&end=666' },
        { given: 'https://www.youtube-nocookie.com/embed/youtubenocookie1videoId', expected: 'https://app.pix.fr/youtube-video.html?v=youtubenocookie1videoId' },
        { given: 'https://www.youtube-nocookie.com/embed/youtubenocookie3videoId?start=123', expected: 'https://app.pix.fr/youtube-video.html?v=youtubenocookie3videoId&start=123' },
        { given: 'https://www.youtube-nocookie.com/embed/youtubenocookie3videoId?start=123&end=456', expected: 'https://app.pix.fr/youtube-video.html?v=youtubenocookie3videoId&start=123&end=456' },
      ];

      const tutorials = links.map((link) => new Tutorial({ link: link.given }));

      const logger = {
        info: vi.fn(),
        warn: vi.fn(),
      };

      // when
      tutorials.forEach((tutorial) => tutorial.rewriteYoutubeVideoLink({ logger }));

      // then
      tutorials.forEach((tutorial, index) => expect(tutorial).toHaveProperty('link', links[index].expected));
    });
  });
});
