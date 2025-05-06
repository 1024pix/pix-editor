import { emptyAllTables } from '../../db/knex-database-connection.js';
import 'dotenv/config';
import { fileURLToPath } from 'node:url';
import { logger } from '../../lib/infrastructure/logger.js';
import Airtable from 'airtable';

const tablesAndRecordIds = {
  'Referentiel': 'Record ID',
  'Domaines': 'Record ID',
  'Competences': 'Record ID',
  'Thematiques': 'Record Id',
  'Tubes': 'Record Id',
  'Acquis': 'Record Id',
  'Epreuves': 'Record ID',
  'Tutoriels': 'Record ID',
  'Tags': 'Record ID',
  'Attachments': 'Record ID',
};

const __filename = fileURLToPath(import.meta.url);
const isLaunchedFromCommandLine = process.argv[1] === __filename;
async function main() {
  logger.info('Emptying all POSTGRESQL tables...');
  await emptyAllTables();
  logger.info('Done!');
  logger.info('Emptying Airtable base...');
  await emptyAirtable();
  logger.info('Done!');
  process.exit(0);
}

(async () => {
  if (isLaunchedFromCommandLine) {
    try {
      await main();
    } catch (error) {
      logger.error(error);
      process.exitCode = 1;
    }
  }
})();

async function emptyAirtable() {
  const res = await fetch('https://api.airtable.com/v0/meta/bases', {
    headers: {
      'Authorization': `Bearer ${process.env.AIRTABLE_API_KEY_META_DATA}`,
    },
    credentials: 'include',
  });
  const body = await res.json();
  const airtableBase = body.bases.find((base) => base.id === process.env.AIRTABLE_BASE);
  if (!airtableBase.name.includes('- DEV -')) {
    logger.error(`Not allowed to empty Airtable base "${airtableBase.name}"`);
    return;
  }
  const airtableClient = new Airtable({
    apiKey: process.env.AIRTABLE_API_KEY,
  }).base(process.env.AIRTABLE_BASE);
  for (const [tableName, idKey] of Object.entries(tablesAndRecordIds)) {
    logger.info(`\tEmptying ${tableName}...`);
    const rawRecords = await airtableClient.table(tableName)
      .select({ fields: [idKey] })
      .all();
    const ids = rawRecords.map((rawRecord) => rawRecord.fields[idKey]);
    let progression = 0;
    for (const chunk of chunks(ids, 10)) {
      await airtableClient.table(tableName).destroy(chunk);
      progression = progression + chunk.length;
      process.stdout.cursorTo(0);
      process.stdout.write(`${Math.round((progression * 100) / ids.length, 2)} %`);
    }
    process.stdout.cursorTo(0);
  }
}

function chunks(items, size) {
  const chunks = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}
