import { knex } from '../../db/knex-database-connection.js';
import { ScriptRunner } from '../../lib/application/scripts/script-runner.js';
import { Script } from '../../lib/application/scripts/script.js';
import * as airtable from '../../lib/infrastructure/airtable.js';

export class CopySkillsFromAirtableToPg extends Script {
  constructor() {
    super({
      description: 'Copie des acquis de Airtable vers Postgres',
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

    const airtableSkills = await airtable.findRecords('Acquis', {
      fields: [
        'id persistant',
        "Statut de l'indice",
        'Comprendre (id persistant)',
        'En savoir plus (id persistant)',
        'Status',
        'Tube (id persistant)',
        'Description',
        'Level',
        'Internationalisation',
        'Version',
        'Statut de la description',
      ],
    });
    logger.info({ count: airtableSkills.length }, 'Loaded skills from airtable');

    const skills = airtableSkills.map((record) => ({
      id: record.get('id persistant'),
      hintStatus: record.get("Statut de l'indice"),
      status: record.get('Status'),
      tubeId: record.get('Tube (id persistant)')[0],
      description: record.get('Description'),
      level: record.get('Level'),
      internationalisation: record.get('Internationalisation'),
      version: record.get('Version'),
      descriptionStatus: record.get('Statut de la description'),
      createdAt: record._rawJson.createdTime,
      updatedAt: knex.fn.now(),
    }));

    const skillsTutorialsRelations = airtableSkills.flatMap((record) => [
      ...(record.get('Comprendre (id persistant)')?.map((tutorialId) => ({
        skillId: record.get('id persistant'),
        tutorialId,
        type: 'understanding',
        updatedAt: knex.fn.now(),
      })) ?? []),
      ...(record.get('En savoir plus (id persistant)')?.map((tutorialId) => ({
        skillId: record.get('id persistant'),
        tutorialId,
        type: 'learningMore',
        updatedAt: knex.fn.now(),
      })) ?? []),
    ]);

    const postgresOnlyIds = await knex
      .pluck('id')
      .from('skills')
      .whereNotIn('id', knex.select('*').fromRaw('unnest(?::text[])', [skills.map((skill) => skill.id)]));
    if (postgresOnlyIds.length !== 0) {
      logger.warn({ ids: postgresOnlyIds }, 'Some skills are only in postgres');
    }

    if (options.dryRun) return;

    await knex.insert(skills).into('skills').onConflict('id').merge();
    logger.info({ count: skills.length }, 'Inserted skills into postgres');

    const deletedRelationsCount = await knex
      .delete()
      .from('skills-tutorials')
      .whereNotIn(
        [
          'skillId',
          'tutorialId',
          'type',
        ],
        skillsTutorialsRelations.map(({ skillId, tutorialId, type }) => [
          skillId,
          tutorialId,
          type,
        ]),
      );
    logger.info({ count: deletedRelationsCount }, 'Deleted skills tutorials relations into postgres');

    await knex
      .insert(skillsTutorialsRelations)
      .into('skills-tutorials')
      .onConflict([
        'skillId',
        'tutorialId',
        'type',
      ])
      .merge({ updatedAt: knex.fn.now() });
    logger.info({ count: skillsTutorialsRelations.length }, 'Inserted skills tutorials relations into postgres');
  }
}

await ScriptRunner.execute(import.meta.url, CopySkillsFromAirtableToPg);
