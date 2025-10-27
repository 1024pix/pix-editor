import { knex } from '../../db/knex-database-connection.js';
import { ScriptRunner } from '../../lib/application/scripts/script-runner.js';
import { Script } from '../../lib/application/scripts/script.js';
import * as airtable from '../../lib/infrastructure/airtable.js';

export class CopyTubesFromAirtableToPg extends Script {
  constructor() {
    super({
      description: 'Copie des tubes de Airtable vers Postgres',
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

    const airtableTubes = await airtable.findRecords('Tubes', {
      fields: ['id persistant', 'Nom', 'Index', 'Thematique (id persistant)'],
    });
    logger.info({ count: airtableTubes.length }, 'Loaded tubes from airtable');

    const tubes = airtableTubes.map((record) => ({
      id: record.get('id persistant'),
      name: record.get('Nom'),
      index: record.get('Index'),
      thematicId: record.get('Thematique (id persistant)')[0],
      createdAt: record._rawJson.createdTime,
      updatedAt: knex.fn.now(),
    }));

    if (options.dryRun) return;

    await knex.insert(tubes).into('tubes').onConflict('id').merge();
    logger.info({ count: tubes.length }, 'Inserted tubes into postgres');
  }
}

await ScriptRunner.execute(import.meta.url, CopyTubesFromAirtableToPg);
