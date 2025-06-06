import { Script } from '../lib/application/scripts/script.js';
import { ScriptRunner } from '../lib/application/scripts/script-runner.js';
import { knex } from '../db/knex-database-connection.js';
import { attachmentDatasource } from '../lib/infrastructure/datasources/airtable/index.js';

export class CopyAirtableAttachmentsToPG extends Script {
  constructor() {
    super({
      description: 'Dump existing attachments in Airtable to PG table',
      permanent: false,
      options: {
        dryRun: {
          type: 'boolean',
          describe: 'If true, it does not persist any creation in PG made during the script.',
          demandOption: true,
          default: true,
        },
      },
    });
  }

  async handle({ options, logger }) {
    const dryRun = options.dryRun;
    const attachmentDatasources = await attachmentDatasource.list();
    logger.info(`${attachmentDatasources.length} attachments trouvés.`);
    try {
      await knex.transaction(async function(trx) {
        const attachmentsForDB = attachmentDatasources.map(fromDatasourceToDB);
        for (const chunk of chunks(attachmentsForDB, 500)) {
          logger.info(`Insertion de ${chunk.length}/${attachmentsForDB.length} attachments...`);
          await trx('attachments').insert(chunk).onConflict('id').merge();
        }
        if (dryRun) {
          throw new Error('DRY RUN ENABLED, not persisting anything');
        }
      });
    } catch (err) {
      if (err.message !== 'DRY RUN ENABLED, not persisting anything') {
        logger.error(err);
        throw err;
      }
    }
    logger.info('Attachments recopiés avec succès.');
  }
}

function fromDatasourceToDB(attachmentDatasource) {
  return {
    id: attachmentDatasource.id,
    airtableId: attachmentDatasource.id,
    filename: attachmentDatasource.filename,
    url: attachmentDatasource.url,
    type: attachmentDatasource.type,
    size: attachmentDatasource.size,
    mimeType: attachmentDatasource.mimeType,
    challengeId: attachmentDatasource.challengeId,
    airtableChallengeId: attachmentDatasource.airtableChallengeId,
    localizedChallengeId: attachmentDatasource.localizedChallengeId,
  };
}

function* chunks(array, size) {
  for (let i = 0; i < array.length; i += size) {
    yield array.slice(i, i + size);
  }
}

await ScriptRunner.execute(import.meta.url, CopyAirtableAttachmentsToPG);
