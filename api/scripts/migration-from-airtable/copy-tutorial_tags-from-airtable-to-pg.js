import { knex } from '../../db/knex-database-connection.js';
import { ScriptRunner } from '../../lib/application/scripts/script-runner.js';
import { Script } from '../../lib/application/scripts/script.js';
import * as airtable from '../../lib/infrastructure/airtable.js';

export class CopyTutorialTagsFromAirtableToPg extends Script {
  constructor() {
    super({
      description: 'Copie des tags de tutoriels de Airtable vers Postgres',
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

    const airtableTutorialTags = await airtable.findRecords('Tags', {
      fields: ['id persistant', 'Nom'],
    });
    logger.info({ count: airtableTutorialTags.length }, 'Loaded tutorial tags from airtable');

    const tutorialTags = airtableTutorialTags.map((record) => ({
      id: record.get('id persistant'),
      title: record.get('Nom'),
      createdAt: record._rawJson.createdTime,
      updatedAt: knex.fn.now(),
    }));

    const postgresOnlyIds = await knex
      .pluck('id')
      .from('tutorial_tags')
      .whereNotIn(
        'id',
        knex.select('*').fromRaw('unnest(?::text[])', [tutorialTags.map((tutorialTag) => tutorialTag.id)]),
      );
    if (postgresOnlyIds.length !== 0) {
      logger.warn({ ids: postgresOnlyIds }, 'Some tutorial tags are only in postgres');
    }

    if (options.dryRun) return;

    await knex.insert(tutorialTags).into('tutorial_tags').onConflict('id').merge();
    logger.info({ count: tutorialTags.length }, 'Inserted tutorial tags into postgres');
  }
}

await ScriptRunner.execute(import.meta.url, CopyTutorialTagsFromAirtableToPg);
