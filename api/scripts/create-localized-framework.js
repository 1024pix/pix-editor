import { areaRepository, localizedFrameworksTubesRepository, tubeRepository } from '../lib/infrastructure/repositories/index.js';
import { Script } from '../lib/application/scripts/script.js';
import { ScriptRunner } from '../lib/application/scripts/script-runner.js';
import { LocalizedFrameworkTubes } from '../lib/domain/models/LocalizedFrameworkTubes.js';
import { DomainTransaction } from '../lib/domain/DomainTransaction.js';

export class CreateLocalizedFrameworks extends Script {
  constructor() {
    super({
      description: 'Script de création des entités localized frameworks',
      permanent: true,
      options: {
        dryRun: {
          type: 'boolean',
          describe: 'If true, it does not perform any creation.',
          demandOption: true,
          default: true,
        },
        locales: {
          type: 'array',
          describe: 'Locale to create (space separated)',
          demandOption: true,
        },
        frameworkIds: {
          type: 'array',
          describe: 'Framework ID to create (space separated)',
          demandOption: false,
        },
      },
    });
  }

  async handle({ options, logger }) {
    logger.info({ dryRun: options.dryRun, locales: options.locales, frameworkIds: options.frameworkIds }, 'Script options');

    return DomainTransaction.execute(async () => {
      const knexConn = DomainTransaction.getConnection();

      let tubes;
      if (options.frameworkIds) {
        const frameworksTubes = await Promise.all(options.frameworkIds.map((frameworkId) => loadFrameworkTubes(frameworkId)));
        tubes = frameworksTubes.flat();
      } else {
        tubes = await tubeRepository.list();
      }

      const tubesWithoutWorkbench = tubes.filter((tube) => !tube.isWorkbench);

      if (tubesWithoutWorkbench.length === 0) {
        logger.info('No localized framework to create');
        return;
      }
      logger.info({ count: tubesWithoutWorkbench.length }, 'Tubes were found');

      for (const locale of options.locales) {
        const localizedFrameworkTubes = tubesWithoutWorkbench.map((tube) => new LocalizedFrameworkTubes({ tubeId: tube.id, locale, maxLevel: 8 }));

        await localizedFrameworksTubesRepository.save(localizedFrameworkTubes, { onConflict: 'ignore' });

        logger.info({ locale, count: localizedFrameworkTubes.length }, 'Localized framework tubes were created for locale');
      }

      if (options.dryRun) {
        logger.info('Dry run, will rollback modifications');
        await knexConn.rollback();
      }
    });
  }
}

async function loadFrameworkTubes(frameworkId) {
  const areas = await areaRepository.listByFrameworkId(frameworkId);
  const areasTubes = await Promise.all(areas.flatMap((area) => area.competenceIds.map((competenceId) => tubeRepository.listByCompetenceId(competenceId))));
  return areasTubes.flat();
}

await ScriptRunner.execute(import.meta.url, CreateLocalizedFrameworks);
