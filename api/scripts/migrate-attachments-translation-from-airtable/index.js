import { fileURLToPath } from 'node:url';
import Airtable from 'airtable';
import _ from 'lodash';
import { extractFromProxyObject } from '../../lib/infrastructure/translations/attachment.js';
import { translationRepository } from '../../lib/infrastructure/repositories/index.js';
import { disconnect } from '../../db/knex-database-connection.js';

const __filename = fileURLToPath(import.meta.url);
const isLaunchedFromCommandLine = process.argv[1] === __filename;

export async function migrateAttachmentsTranslationFromAirtable({ airtableClient }) {
  const allAttachments = await airtableClient
    .table('Attachments')
    .select({
      fields: [
        'alt',
        'localizedChallengeId',
      ],
    })
    .all();

  const translations = [];

  for (const attachment of allAttachments) {
    const objectTranslations = await extractFromProxyObject({
      alt: attachment.get('alt'),
      localizedChallengeId: attachment.get('localizedChallengeId')
    });
    translations.push(...objectTranslations);
  }

  for (const translationsChunk of _.chunk(translations, 5000)) {
    await translationRepository.save({ translations: translationsChunk });
  }
}

async function main() {
  if (!isLaunchedFromCommandLine) return;

  try {
    const airtableClient = new Airtable({
      apiKey: process.env.AIRTABLE_API_KEY,
    }).base(process.env.AIRTABLE_BASE);

    await migrateAttachmentsTranslationFromAirtable({ airtableClient });
  } catch (e) {
    console.error(e);
    process.exitCode = 1;
  } finally {
    await disconnect();
  }
}

main();
