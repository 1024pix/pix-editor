import { knex } from '../../db/knex-database-connection.js';
import { ScriptRunner } from '../../lib/application/scripts/script-runner.js';
import { Script } from '../../lib/application/scripts/script.js';
import * as airtable from '../../lib/infrastructure/airtable.js';

export class CopyTutorialsFromAirtableToPg extends Script {
  constructor() {
    super({
      description: 'Copie des tutoriels de Airtable vers Postgres',
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

    const airtableTutorials = await airtable.findRecords('Tutoriels', {
      fields: [
        'id persistant',
        'Durée',
        'Format',
        'Lien',
        'Source',
        'Titre',
        'Langue',
        'License',
        'niveau',
        'CoupDeCoeur',
        'Tags (id persistant)',
      ],
    });
    logger.info({ count: airtableTutorials.length }, 'Loaded tutorials from airtable');

    const tutorials = airtableTutorials.map((record) => ({
      id: record.get('id persistant'),
      duration: record.get('Durée'),
      format: record.get('Format'),
      link: record.get('Lien'),
      source: record.get('Source'),
      title: record.get('Titre'),
      locale: record.get('Langue'),
      license: record.get('License'),
      level: record.get('niveau'),
      crush: record.get('CoupDeCoeur') === 'YES',
      createdAt: record._rawJson.createdTime,
      updatedAt: knex.fn.now(),
    }));

    const tutorialsTagsRelations = airtableTutorials.flatMap(
      (record) =>
        record.get('Tags (id persistant)')?.map((tutorialTagId) => ({
          tutorialId: record.get('id persistant'),
          tutorialTagId,
          updatedAt: knex.fn.now(),
        })) ?? [],
    );

    if (options.dryRun) return;

    await knex.insert(tutorials).into('tutorials').onConflict('id').merge();
    logger.info({ count: tutorials.length }, 'Inserted tutorials into postgres');

    const deletedRelationsCount = await knex
      .delete()
      .from('tutorials-tutorial_tags')
      .whereNotIn(
        knex.raw('(??, ??)', [knex.ref('tutorialId'), knex.ref('tutorialTagId')]),
        tutorialsTagsRelations.map(({ tutorialId, tutorialTagId }) => [tutorialId, tutorialTagId]),
      );
    logger.info({ count: deletedRelationsCount }, 'Deleted tutorials tutorial_tags relations into postgres');

    await knex
      .insert(tutorialsTagsRelations)
      .into('tutorials-tutorial_tags')
      .onConflict(['tutorialId', 'tutorialTagId'])
      .merge({ updatedAt: knex.fn.now() });
    logger.info({ count: tutorialsTagsRelations.length }, 'Inserted tutorials tutorial_tags relations into postgres');
  }
}

await ScriptRunner.execute(import.meta.url, CopyTutorialsFromAirtableToPg);
