const _ = require('lodash');
const Airtable = require('airtable');
const airtableSettings = require('../config').airtable;
const logger = require('./logger');

const LIMIT_UPDATE_RECORDS_SIZE = 10;
const BASES = {
  LEARNING_CONTENT: 'learningContent',
  CHANGELOG: 'changelog',
};

function _airtableClient(base = BASES.LEARNING_CONTENT) {
  if (base === BASES.LEARNING_CONTENT) return new Airtable({ apiKey: airtableSettings.apiKey }).base(airtableSettings.base);
  else if (base === BASES.CHANGELOG) return new Airtable({ apiKey: airtableSettings.apiKey }).base(airtableSettings.editorBase);
  throw new Error(`Unknown Airtable base ${base}`);
}

function findRecords(tableName, options = {}, base) {
  logger.info({ tableName }, 'Querying Airtable');
  return _airtableClient(base)
    .table(tableName)
    .select(options)
    .all();
}

async function findRecord(tableName, options = {}, base) {
  logger.info({ tableName }, 'Querying Airtable for one record');
  const records = await _airtableClient(base)
    .table(tableName)
    .select({ ...options, maxRecords: 1 })
    .all();
  return records.length > 0 ? records : null;
}

async function createRecord(tableName, body, base) {
  const records = await _airtableClient(base)
    .table(tableName)
    .create([body]);
  return records[0];
}

async function updateRecord(tableName, body, base) {
  const records = await _airtableClient(base)
    .table(tableName)
    .update([body]);
  return records[0];
}

async function updateRecords(tableName, body, base) {
  const updatedRecords = [];
  for (const chunkRecords of _.chunk(body, LIMIT_UPDATE_RECORDS_SIZE)) {
    const updatedChunkRecords = await _airtableClient(base)
      .table(tableName)
      .update(chunkRecords);
    updatedRecords.push(updatedChunkRecords);
  }
  return updatedRecords;
}

module.exports = {
  findRecord,
  findRecords,
  createRecord,
  updateRecord,
  updateRecords,
  BASES,
};
