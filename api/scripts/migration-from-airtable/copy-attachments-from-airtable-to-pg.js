import { knex } from '../../db/knex-database-connection.js';
import { ScriptRunner } from '../../lib/application/scripts/script-runner.js';
import { Script } from '../../lib/application/scripts/script.js';
import * as airtable from '../../lib/infrastructure/airtable.js';

export class CopyAttachmentsFromAirtableToPg extends Script {
  constructor() {
    super({
      description: 'Copie des pièces jointes et illustrations de Airtable vers Postgres',
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

    const airtableAttachments = await airtable.findRecords('Attachments', {
      fields: ['url', 'size', 'type', 'mimeType', 'filename', 'challengeId persistant', 'localizedChallengeId'],
    });
    logger.info({ count: airtableAttachments.length }, 'Loaded attachments from airtable');

    const attachments = airtableAttachments.map((record) => ({
      id: record.id,
      url: record.get('url'),
      size: record.get('size'),
      type: record.get('type'),
      mimeType: record.get('mimeType'),
      filename: record.get('filename'),
      challengeId: record.get('challengeId persistant')?.[0],
      localizedChallengeId: record.get('localizedChallengeId'),
      createdAt: record._rawJson.createdTime,
      updatedAt: knex.fn.now(),
    }));

    if (options.dryRun) return;

    const deletedCount = await knex
      .delete()
      .from('attachments')
      .whereNotIn(
        'id',
        attachments.map((attachment) => attachment.id),
      );
    logger.info({ count: deletedCount }, 'Deleted attachments into postgres');

    await knex.insert(attachments).into('attachments').onConflict('id').merge();
    logger.info({ count: attachments.length }, 'Inserted attachments into postgres');
  }
}

await ScriptRunner.execute(import.meta.url, CopyAttachmentsFromAirtableToPg);
