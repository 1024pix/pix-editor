import Airtable from 'airtable';
import * as config from '../config.js';
import { logger } from './logger.js';
import _ from 'lodash';

function _airtableClient() {
  return new Airtable({ apiKey: config.airtable.apiKey }).base(config.airtable.base);
}

export function findRecords(tableName, options = {}) {
  logger.info({ tableName }, 'Querying Airtable');
  return _airtableClient().table(tableName).select(options).all();
}

export function findRecord(tableName, recordId) {
  logger.info({ tableName }, 'Querying Airtable');
  return _airtableClient().table(tableName).find(recordId);
}

export async function createRecord(tableName, body) {
  const records = await _airtableClient().table(tableName).create([body]);
  return records[0];
}

export async function createRecords(tableName, bodies) {
  const records = [];
  for (const chunkBodies of _.chunk(bodies, 10)) {
    const chunkRecords = await _airtableClient().table(tableName).create(chunkBodies);
    records.push(...chunkRecords);
  }
  return records;
}

export async function updateRecord(tableName, body) {
  const records = await _airtableClient().table(tableName).update([body]);
  return records[0];
}

export async function updateRecords(tableName, bodies) {
  const records = [];
  for (const chunkBodies of _.chunk(bodies, 10)) {
    const chunkRecords = await _airtableClient().table(tableName).update(chunkBodies);
    records.push(...chunkRecords);
  }
  return records;
}

export async function upsertRecords(tableName, records, fieldsToMergeOn) {
  logger.info({ tableName }, 'Upserting redords in Airtable');
  return _airtableClient().table(tableName).update(records, { performUpsert: { fieldsToMergeOn } });
}

export async function deleteRecords(tableName, recordIds) {
  logger.info({ tableName }, 'Deleting records in Airtable');
  for (const chunk of chunks(recordIds, 10)) {
    await _airtableClient().table(tableName).destroy(chunk);
  }
}

export function stringValue(value) {
  return `"${value.replace(/\r/g, '').replace(/["\\]/g, '\\$&').replace(/\n/g, '\\n').replace(/\t/g, '\\t')}"`;
}

async function getBaseName() {
  const res = await fetch('https://api.airtable.com/v0/meta/bases', { headers: { Authorization: `Bearer ${config.airtable.apiKeyMetaData}` } });
  const body = await res.json();
  const airtableBaseName = body?.bases?.find((base) => base.id === config.airtable.base)?.name;
  if (!airtableBaseName) {
    throw new Error('Base name not found');
  }
  return airtableBaseName;
}

export async function canSeedOrEmptyAirtableBase() {
  if (config.seedsConfig.force) {
    return true;
  }
  let airtableBaseName;
  try {
    airtableBaseName = await getBaseName();
  } catch {
    return false;
  }
  return airtableBaseName.includes('- DEV -');
}

export async function emptyAllTables({ showProgression = false } = {}) {
  const tablesAndRecordIds = {
    Referentiel: 'Record ID',
    Domaines: 'Record ID',
    Competences: 'Record ID',
    Thematiques: 'Record Id',
    Tubes: 'Record Id',
    Acquis: 'Record Id',
    Epreuves: 'Record ID',
    Tutoriels: 'Record ID',
    Tags: 'Record ID',
    Attachments: 'Record ID',
  };
  const canEmpty = await canSeedOrEmptyAirtableBase();
  if (!canEmpty) {
    logger.error('Not allowed to empty Airtable base');
    return;
  }
  for (const [tableName, idKey] of Object.entries(tablesAndRecordIds)) {
    if (showProgression) logger.info(`\tFetching "${tableName}" ids...`);
    const rawRecords = await _airtableClient()
      .table(tableName)
      .select({ fields: [idKey] })
      .all();
    if (showProgression) logger.info(`\tEmptying ${rawRecords.length} from "${tableName}"...`);
    const ids = rawRecords.map((rawRecord) => rawRecord.fields[idKey]);
    let progression = 0;
    for (const chunk of chunks(ids, 10)) {
      await _airtableClient().table(tableName).destroy(chunk);
      progression = progression + chunk.length;
      if (showProgression) {
        process.stdout.cursorTo(0);
        process.stdout.write(`${Math.round((progression * 100) / ids.length, 2)} %`);
      }
    }
    if (showProgression) process.stdout.cursorTo(0);
  }
}

function* chunks(items, size) {
  for (let i = 0; i < items.length; i += size) {
    yield items.slice(i, i + size);
  }
}
