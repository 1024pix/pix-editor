import { knex } from '../../db/knex-database-connection.js';
import { ScriptRunner } from '../../lib/application/scripts/script-runner.js';
import { Script } from '../../lib/application/scripts/script.js';
import * as airtable from '../../lib/infrastructure/airtable.js';

export class CopyThematicsFromAirtableToPg extends Script {

  constructor() {
    super({
      description: 'Copie des thématiques de Airtable vers Postgres',
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

    const airtableThematics = await airtable.findRecords('Thematiques', {
      fields: ['id persistant', 'Index', 'Competence (id persistant)'],
    });
    logger.info({ count: airtableThematics.length }, 'Loaded thematics from airtable');

    const thematics = airtableThematics.map((record) => ({
      id: record.get('id persistant'),
      index: record.get('Index'),
      competenceId: record.get('Competence (id persistant)')[0],
      createdAt: record._rawJson.createdTime,
      updatedAt: knex.fn.now(),
    }));

    if (options.dryRun) return;

    await knex.insert(thematics).into('thematics').onConflict('id').merge();
    logger.info({ count: thematics.length }, 'Inserted thematics into postgres');
  }
}

await ScriptRunner.execute(import.meta.url, CopyThematicsFromAirtableToPg);
