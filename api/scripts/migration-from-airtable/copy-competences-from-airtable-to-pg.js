import { knex } from '../../db/knex-database-connection.js';
import { ScriptRunner } from '../../lib/application/scripts/script-runner.js';
import { Script } from '../../lib/application/scripts/script.js';
import * as airtable from '../../lib/infrastructure/airtable.js';

export class CopyCompetencesFromAirtableToPg extends Script {
  constructor() {
    super({
      description: 'Copie des compétences de Airtable vers Postgres',
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

    const airtableCompetences = await airtable.findRecords('Competences', {
      fields: ['id persistant', 'Sous-domaine', 'Domaine (id persistant)'],
    });
    logger.info({ count: airtableCompetences.length }, 'Loaded competences from airtable');

    const competences = airtableCompetences.map((record) => ({
      id: record.get('id persistant'),
      index: record.get('Sous-domaine'),
      areaId: record.get('Domaine (id persistant)')[0],
      createdAt: record._rawJson.createdTime,
      updatedAt: knex.fn.now(),
    }));

    if (options.dryRun) return;

    await knex.insert(competences).into('competences').onConflict('id').merge();
    logger.info({ count: competences.length }, 'Inserted competences into postgres');
  }
}

await ScriptRunner.execute(import.meta.url, CopyCompetencesFromAirtableToPg);
