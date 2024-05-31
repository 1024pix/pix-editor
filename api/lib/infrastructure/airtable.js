import Airtable from 'airtable';
import * as config from '../config.js';
import { logger } from './logger.js';
import _ from 'lodash';

function _airtableClient() {
  return new Airtable({ apiKey: config.airtable.apiKey }).base(config.airtable.base);
}

export function findRecords(tableName, options = {}) {
  logger.info({ tableName }, 'Querying Airtable');
  return _airtableClient()
    .table(tableName)
    .select(options)
    .all();
}

export async function createRecord(tableName, body) {
  const records = await _airtableClient()
    .table(tableName)
    .create([body]);
  return records[0];
}

export async function createRecords(tableName, bodies) {
  const records = [];
  for (const chunkBodies  of _.chunk(bodies, 10)) {
    const chunkRecords = await _airtableClient()
      .table(tableName)
      .create(chunkBodies);
    records.push(...chunkRecords) ;
  }
  return records;
}

export async function updateRecord(tableName, body) {
  const records = await _airtableClient()
    .table(tableName)
    .update([body]);
  return records[0];
}

export async function upsertRecords(tableName, records, fieldsToMergeOn) {
  logger.info({ tableName }, 'Upserting redords in Airtable');
  return _airtableClient().table(tableName).update(
    records,
    {
      performUpsert: {
        fieldsToMergeOn,
      },
    },
  );
}

export async function deleteRecords(tableName, recordIds) {
  logger.info({ tableName }, 'Deleting records in Airtable');
  return _airtableClient().table(tableName).destroy(recordIds);
}
