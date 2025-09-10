import { tutorialRepository } from '../lib/infrastructure/repositories/index.js';
import { Script } from '../lib/application/scripts/script.js';
import { ScriptRunner } from '../lib/application/scripts/script-runner.js';

export class DeleteTutorials extends Script {
  constructor() {
    super({
      description: 'Script de suppression de tutoriels',
      permanent: true,
      options: {
        dryRun: {
          type: 'boolean',
          describe: 'If true, it does not perform any deletion.',
          demandOption: true,
          default: true,
        },
        id: {
          type: 'array',
          describe: 'Id of tutorials to delete (space separated)',
          demandOption: true,
        },
      },
    });
  }

  async handle({ options, logger }) {
    logger.info({ dryRun: options.dryRun, ids: options.id }, 'Script options');

    const tutorials = await tutorialRepository.getMany(options.id);

    if (tutorials.length === 0) {
      logger.info('No tutorials were found');
      return;
    }

    const ids = tutorials.map((tutorial) => tutorial.id);
    logger.info({ ids }, `${tutorials.length} tutorials were found and will be deleted`);

    if (options.dryRun) {
      logger.info('Dry run, stopping before deletion');
      return;
    }

    await tutorialRepository.delete(ids);
  }
}

await ScriptRunner.execute(import.meta.url, DeleteTutorials);
