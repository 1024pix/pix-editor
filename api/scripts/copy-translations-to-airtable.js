import { translationRepository } from '../lib/infrastructure/repositories/index.js';
import { translationDatasource } from '../lib/infrastructure/datasources/airtable/index.js';
import { Script } from '../lib/application/scripts/script.js';
import { ScriptRunner } from '../lib/application/scripts/script-runner.js';

export class CopyTranslationsToAirtable extends Script {
  constructor() {
    super({
      description: 'Script de copie des translations de PG vers Airtable',
      permanent: true,
      options: {},
    });
  }

  async handle({ logger }) {
    const translations = await translationRepository.list();

    if (translations.length === 0) {
      logger.info('No translations were found');
      return;
    }

    logger.info(`Inserting ${translations.length} translations in Airtable`);

    await translationDatasource.upsert(translations);
  }
}

await ScriptRunner.execute(import.meta.url, CopyTranslationsToAirtable);
