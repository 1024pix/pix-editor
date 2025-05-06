const AIRTABLE_WRITE_LIMIT = 10;

function chunksForAirtable(items) {
  const chunks = [];
  for (let i = 0; i < items.length; i += AIRTABLE_WRITE_LIMIT) {
    chunks.push(items.slice(i, i + AIRTABLE_WRITE_LIMIT));
  }
  return chunks;
}

export function pickRandomValueInObj(obj, ignoreEmptyValues) {
  return pickNRandomValuesInObj(obj, 1, ignoreEmptyValues)[0];
}

export function pickNRandomValuesInObj(obj, N, ignoreEmptyValues = true) {
  let values = Object.values(obj);
  if (ignoreEmptyValues) {
    values = values.filter((v) => Boolean(v));
  }
  return [...Array(N)].map(() => {
    const pickedValue = pickRandomValueInArr(values);
    values = values.filter((val) => val !== pickedValue);
    return pickedValue;
  });
}

export function pickRandomValueInArr(arr) {
  return pickNRandomValueInArr(arr, 1)[0];
}

export function pickNRandomValueInArr(arr, N) {
  let values = [...arr];
  return [...Array(N)].map(() => {
    const pickedValue = values[Math.floor(Math.random() * values.length)];
    values = values.filter((val) => val !== pickedValue);
    return pickedValue;
  });
}

export function pickRandomBoolean() {
  return [true, false][Math.floor(Math.random() * 2)];
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
  logger.info('Done !');
  return records;
}
