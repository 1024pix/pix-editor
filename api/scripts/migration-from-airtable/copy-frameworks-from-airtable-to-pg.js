import { knex } from '../../db/knex-database-connection.js';
import { ScriptRunner } from '../../lib/application/scripts/script-runner.js';
import { Script } from '../../lib/application/scripts/script.js';
import * as airtable from '../../lib/infrastructure/airtable.js';

export class CopyFrameworksFromAirtableToPg extends Script {

  constructor() {
    super({
      description: 'Copie des référentiels de Airtable vers Postgres',
      permanent: false,
      options: {
        dryRun: {
          type: 'boolean',
          describe: 'If true, it does not persist insert/updates made during the script.',
          demandOption: false,
          default: true,
        },
      },
    });
  }

  async handle({ options, logger }) {
    logger.info({ dryRun: options.dryRun }, 'Script options');

    const airtableFrameworks = await airtable.findRecords('Referentiel', {
      fields: ['Nom'],
    });
    logger.info({ count: airtableFrameworks.length }, 'Loaded frameworks from airtable');

    const frameworks = airtableFrameworks.map((record) => ({
      id: record.id,
      name: record.get('Nom'),
      createdAt: record._rawJson.createdTime,
      updatedAt: knex.fn.now(),
    }));

    if (options.dryRun) return;

    await knex.insert(frameworks).into('frameworks').onConflict('id').merge();
    logger.info({ count: frameworks.length }, 'Inserted frameworks into postgres');
  }
}

await ScriptRunner.execute(import.meta.url, CopyFrameworksFromAirtableToPg);
