import { beforeEach, describe, expect, it } from 'vitest';

import { databaseBuilder, domainBuilder, knex } from '../test-helper.js';
import { MigrateYoutubeTutorials } from '../../scripts/migrate-youtube-tutorials.js';
import { logger } from '../../lib/infrastructure/logger.js';

describe('Script | MigrateYoutubeTutorials', () => {
  /** @type {MigrateYoutubeTutorials} */
  let script;

  beforeEach(() => {
    script = new MigrateYoutubeTutorials();
  });

  describe('#handle', () => {
    beforeEach(async () => {
      const tutorials = [
        { id: 'tuto', link: 'https://test.youtube.com/watch?v=nop', tagIds: [] },
        { id: 'youtube', link: 'https://youtu.be/youtube2videoId?t=123', tagIds: [] },
        { id: 'youtubecom', link: 'www.youtube.com/watch?v=youtubecomvideoId&start=333&end=666', tagIds: [] },
        { id: 'youtubenocookie', link: 'https://www.youtube-nocookie.com/embed/youtubenocookievideoId?start=123', tagIds: [] },
      ];

      tutorials.map(domainBuilder.buildTutorialDatasourceObject).forEach(databaseBuilder.factory.buildTutorial);

      await databaseBuilder.commit();
    });

    it('migrates youtube tutorials to PixApp’s Youtube page', async () => {
      // given
      const options = { dryRun: false };

      // when
      await script.handle({ options, logger });

      // then
      await expect(knex.select('id', 'link').from('tutorials').orderBy('id')).resolves.toStrictEqual([
        { id: 'tuto', link: 'https://test.youtube.com/watch?v=nop' },
        { id: 'youtube', link: 'https://app.pix.fr/youtube-video.html?v=youtube2videoId&start=123' },
        { id: 'youtubecom', link: 'https://app.pix.fr/youtube-video.html?v=youtubecomvideoId&start=333&end=666' },
        { id: 'youtubenocookie', link: 'https://app.pix.fr/youtube-video.html?v=youtubenocookievideoId&start=123' },
      ]);
    });

    describe('when dryRun option is true', () => {
      it('rollbacks modifications', async () => {
        // given
        const options = { dryRun: true };

        // when
        await script.handle({ options, logger });

        // then
        await expect(knex.select('id', 'link').from('tutorials').orderBy('id')).resolves.toStrictEqual([
          { id: 'tuto', link: 'https://test.youtube.com/watch?v=nop' },
          { id: 'youtube', link: 'https://youtu.be/youtube2videoId?t=123' },
          { id: 'youtubecom', link: 'www.youtube.com/watch?v=youtubecomvideoId&start=333&end=666' },
          { id: 'youtubenocookie', link: 'https://www.youtube-nocookie.com/embed/youtubenocookievideoId?start=123' },
        ]);
      });
    });
  });
});
