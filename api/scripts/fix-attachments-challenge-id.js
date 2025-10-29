import { knex } from '../db/knex-database-connection.js';
import { ScriptRunner } from '../lib/application/scripts/script-runner.js';
import { Script } from '../lib/application/scripts/script.js';
import * as airtable from '../lib/infrastructure/airtable.js';

export class FixAttachmentsChallengeId extends Script {
  constructor() {
    super({
      description: 'Répare les pièces jointes et illustration n’ayant plus de lien d’épreuve',
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

    const brokenAttachments = await airtable.findRecords('Attachments', {
      fields: ['localizedChallengeId'],
      filterByFormula: 'challengeId = BLANK()',
    });
    if (brokenAttachments.length === 0) {
      logger.info('Found no attachments with no challenge in airtable');
      return;
    }
    logger.info({ count: brokenAttachments.length }, 'Found attachments with no challenge in airtable');

    const localizedChallenges = await knex
      .select('id', 'challengeId')
      .from('localized_challenges')
      .whereIn(
        'id',
        brokenAttachments.map((record) => record.get('localizedChallengeId')),
      );
    logger.info({ count: localizedChallenges.length }, 'Loaded localized challenges from postgres');

    const challengeIds = [...new Set(localizedChallenges.map(({ challengeId }) => challengeId))].sort();

    const challenges = await airtable.findRecords('Epreuves', {
      fields: ['id persistant'],
      filterByFormula: `OR(${challengeIds.map((challengeId) => `{id persistant}=${airtable.stringValue(challengeId)}`).join(',')})`,
    });
    logger.info({ count: challenges.length }, 'Loaded challenges from airtable');

    const challengeAirtableIdForChallengeId = Object.fromEntries(
      challenges.map((record) => [record.get('id persistant'), record.id]),
    );

    const challengeAirtableIdForLocalizedChallengeId = Object.fromEntries(
      localizedChallenges.map(({ id, challengeId }) => [id, challengeAirtableIdForChallengeId[challengeId]]),
    );

    const repairedAttachments = brokenAttachments.map((record) => ({
      id: record.id,
      fields: {
        challengeId: [challengeAirtableIdForLocalizedChallengeId[record.get('localizedChallengeId')]],
      },
    }));

    if (options.dryRun) return;

    await airtable.updateRecords('Attachments', repairedAttachments);
    logger.info('Repaired attachments in airtable');
  }
}

await ScriptRunner.execute(import.meta.url, FixAttachmentsChallengeId);
