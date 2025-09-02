const AIRTABLE_WRITE_LIMIT = 10;

function* chunksForAirtable(items) {
  for (let i = 0; i < items.length; i += AIRTABLE_WRITE_LIMIT) {
    yield items.slice(i, i + AIRTABLE_WRITE_LIMIT);
  }
}

function logProgression(progression, total) {
  process.stdout.cursorTo(0);
  process.stdout.write(`${Math.round((progression * 100) / total, 2)} %`);
}

export async function saveInAirtable({ tableName, data, logger, airtableClient }) {
  logger.info(`About to create ${data.length} entries in "${tableName}" table on Airtable...`);
  const records = [];
  let progression = 0;
  for (const chunk of chunksForAirtable(data)) {
    const chunkRecords = await airtableClient.table(tableName).create(chunk);
    records.push(...chunkRecords);
    progression = progression + chunk.length;
    logProgression(progression, data.length);
  }
  process.stdout.cursorTo(0);
  logger.info('Done !');
  return records;
}

export function* cycle(arr) {
  if (arr.length === 0) return;
  while (true) {
    yield* arr;
  }
}
