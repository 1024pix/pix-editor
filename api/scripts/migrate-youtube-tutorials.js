import { Script } from '../lib/application/scripts/script.js';
import { ScriptRunner } from '../lib/application/scripts/script-runner.js';
import { knex } from '../db/knex-database-connection.js';
import { tutorialRepository } from '../lib/infrastructure/repositories/index.js';

export class MigrateYoutubeTutorials extends Script {
  constructor() {
    super({
      description: 'Script de migration des tutoriels Youtube vers l’URL https://app.pix.fr/youtube-video.html',
      permanent: false,
      options: {
        dryRun: {
          type: 'boolean',
          describe: 'If true, it does not perform any migration.',
          demandOption: true,
          default: true,
        },
      },
    });
  }

  async handle({ options, logger }) {
    logger.info({ dryRun: options.dryRun }, 'Script options');

    await knex.transaction(async (transaction) => {
      const tutorials = await tutorialRepository.list({ transaction, forUpdate: true });

      const youtubeVideoTutorials = tutorials.filter((tutorial) => tutorial.isYoutubeVideoLink);

      if (tutorials.length === 0) {
        logger.info('No Youtube video tutorials found');
        return;
      }
      logger.info({ count: youtubeVideoTutorials.length }, 'Youtube video tutorials found');

      youtubeVideoTutorials.forEach((tutorial) => tutorial.rewriteYoutubeVideoLink({ logger }));

      await Promise.all(youtubeVideoTutorials.map((tutorial) => tutorialRepository.update(tutorial, { transaction })));

      if (options.dryRun) {
        logger.info('Dry run, rolling back modifications');
        await transaction.rollback();
      }
    });
  }
}

await ScriptRunner.execute(import.meta.url, MigrateYoutubeTutorials);
