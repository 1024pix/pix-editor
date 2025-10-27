import { knex } from '../../db/knex-database-connection.js';
import { ScriptRunner } from '../../lib/application/scripts/script-runner.js';
import { Script } from '../../lib/application/scripts/script.js';
import * as airtable from '../../lib/infrastructure/airtable.js';

export class CopyAreasFromAirtableToPg extends Script {
  constructor() {
    super({
      description: 'Copie des domaines de Airtable vers Postgres',
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

    const airtableAreas = await airtable.findRecords('Domaines', {
      fields: ['id persistant', 'Code', 'Couleur', 'Referentiel'],
    });
    logger.info({ count: airtableAreas.length }, 'Loaded areas from airtable');

    const areas = airtableAreas.map((record) => ({
      id: record.get('id persistant'),
      code: record.get('Code'),
      color: record.get('Couleur'),
      frameworkId: record.get('Referentiel')[0],
      createdAt: record._rawJson.createdTime,
      updatedAt: knex.fn.now(),
    }));

    if (options.dryRun) return;

    await knex.insert(areas).into('areas').onConflict('id').merge();
    logger.info({ count: areas.length }, 'Inserted areas into postgres');
  }
}

await ScriptRunner.execute(import.meta.url, CopyAreasFromAirtableToPg);
