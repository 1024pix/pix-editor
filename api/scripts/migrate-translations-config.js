import { Script } from '../lib/application/scripts/script.js';
import { ScriptRunner } from '../lib/application/scripts/script-runner.js';
import { knex } from '../db/knex-database-connection.js';
import { areaRepository, frameworkRepository } from '../lib/infrastructure/repositories/index.js';
import * as config from '../lib/config.js';

export class MigrationTranslationsConfig extends Script {
  constructor() {
    super({
      description: 'Script de migration de la config des traductions',
      permanent: false,
    });
  }

  async handle({ logger }) {
    const frameworks = await frameworkRepository.list();
    const areas = await areaRepository.list();

    const configs = config.phrase.projects.map((project) => {
      const { id: frameworkId } = frameworks.find((framework) => framework.name === project.frameworkName);

      let areaId;
      if (project.areaCode) {
        areaId = areas.find((area) => area.frameworkId === frameworkId && area.code == project.areaCode).id;
      }

      return {
        frameworkId,
        areaId,
        phraseProjectId: project.projectId,
        uploadedLocales: '["fr"]',
      };
    });

    if (configs.length === 0) {
      logger.info('Aucune config migrée');
      return;
    }

    const { rowCount } = await knex.insert(configs).into('translations_config');
    logger.info({ rowCount }, 'Configs migrées');
  }
}

await ScriptRunner.execute(import.meta.url, MigrationTranslationsConfig);
