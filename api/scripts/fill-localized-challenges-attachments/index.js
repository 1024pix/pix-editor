import { localizedChallengesAttachmentsRepository } from '../../lib/infrastructure/repositories/index.js';
import { fileURLToPath } from 'node:url';
import Airtable from 'airtable';
import ProgressBar from 'progress';
import { knex, disconnect } from '../../db/knex-database-connection.js';

const __filename = fileURLToPath(import.meta.url);
const isLaunchedFromCommandLine = process.argv[1] === __filename;

export function fillLocalizedChallengesAttachments({ airtableClient }) {
  return knex.transaction(async (transaction) => {
    const attachments = await fetchAttachments({ airtableClient });

    const bar = new ProgressBar('[:bar] :percent', {
      total: attachments.length,
      width: 50,
    });

    for (const attachment of attachments) {
      await localizedChallengesAttachmentsRepository.save({
        attachmentId: attachment.id,
        localizedChallengeId: attachment.localizedChallengeId,
        transaction
      });
      bar.tick();
    }
    return { count: attachments.length };
  });
}

export async function fetchAttachments({ airtableClient }) {
  const allAttachments = await airtableClient
    .table('Attachments')
    .select({
      fields: [
        'Record ID',
        'localizedChallengeId',
      ],
    })
    .all();

  return allAttachments.map((attachment) => {
    const id = attachment.get('Record ID');
    const localizedChallengeId = attachment.get('localizedChallengeId');
    return {
      id,
      localizedChallengeId,
    };
  });
}

async function main() {
  if (!isLaunchedFromCommandLine) return;

  try {
    const airtableClient = new Airtable({
      apiKey: process.env.AIRTABLE_API_KEY,
    }).base(process.env.AIRTABLE_BASE);

    const { count } = await fillLocalizedChallengesAttachments({ airtableClient });
    console.log(`${count} attachments inserted successfully`);
  } catch (e) {
    console.error(e);
    process.exitCode = 1;
  } finally {
    await disconnect();
  }
}

main();
