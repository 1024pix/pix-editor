import { knex } from '../../db/knex-database-connection.js';
import { ScriptRunner } from '../../lib/application/scripts/script-runner.js';
import { Script } from '../../lib/application/scripts/script.js';
import { convertLanguagesToLocales } from '../../lib/domain/services/convert-locales.js';
import * as airtable from '../../lib/infrastructure/airtable.js';

export class CopyChallengesFromAirtableToPg extends Script {

  constructor() {
    super({
      description: 'Copie des épreuves de Airtable vers Postgres',
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

    const airtableChallenges = await airtable.findRecords('Epreuves', {
      fields: [
        'id persistant',
        'Timer',
        'Type d\'épreuve',
        'T1 - Espaces, casse & accents',
        'T2 - Ponctuation',
        'T3 - Distance d\'édition',
        'Statut',
        'Acquix (id persistant)',
        'Embed height',
        'Format',
        'Réponse automatique',
        'Langues',
        'Focalisée',
        'Généalogie',
        'Type péda',
        'Auteur',
        'Déclinable',
        'Version prototype',
        'Version déclinaison',
        'Non voyant',
        'Daltonien',
        'Spoil',
        'Responsive',
        'Difficulté calculée',
        'Discrimination calculée',
        'updated_at',
        'created_at',
        'validated_at',
        'archived_at',
        'made_obsolete_at',
        'shuffled',
        'contextualizedFields',
      ],
    });
    logger.info({ count: airtableChallenges.length }, 'Loaded challenges from airtable');

    const challenges = airtableChallenges.map((record) => ({
      id: record.get('id persistant'),
      type: record.get('Type d\'épreuve'),
      t1Status: record.get('T1 - Espaces, casse & accents') === 'Activé',
      t2Status: record.get('T2 - Ponctuation') === 'Activé',
      t3Status: record.get('T3 - Distance d\'édition') === 'Activé',
      status: record.get('Statut'),
      skillId: record.get('Acquix (id persistant)')?.[0],
      embedHeight: record.get('Embed height'),
      timer: record.get('Timer'),
      format: record.get('Format'),
      autoReply: record.get('Réponse automatique') ?? false,
      locales: convertLanguagesToLocales(record.get('Langues')),
      focusable: record.get('Focalisée') ?? false,
      genealogy: record.get('Généalogie'),
      pedagogy: record.get('Type péda'),
      author: record.get('Auteur'),
      declinable: record.get('Déclinable'),
      version: record.get('Version prototype'),
      alternativeVersion: record.get('Version déclinaison'),
      accessibility1: record.get('Non voyant'),
      accessibility2: record.get('Daltonien'),
      spoil: record.get('Spoil'),
      responsive: record.get('Responsive'),
      delta: record.get('Difficulté calculée'),
      alpha: record.get('Discrimination calculée'),
      updatedAt: record.get('updated_at'),
      validatedAt: record.get('validated_at'),
      archivedAt: record.get('archived_at'),
      madeObsoleteAt: record.get('made_obsolete_at'),
      createdAt: record.get('created_at'),
      shuffled: record.get('shuffled') ?? false,
      contextualizedFields: record.get('contextualizedFields'),
    }));

    if (options.dryRun) return;

    await knex.insert(challenges).into('challenges').onConflict('id').merge();
    logger.info({ count: challenges.length }, 'Inserted challenges into postgres');
  }
}

await ScriptRunner.execute(import.meta.url, CopyChallengesFromAirtableToPg);
