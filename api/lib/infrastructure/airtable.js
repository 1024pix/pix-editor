const _ = require('lodash');
const Airtable = require('airtable');
const airtableSettings = require('../config').airtable;
const logger = require('./logger');

const LIMIT_UPDATE_RECORDS_SIZE = 10;

function _airtableClient() {
  return new Airtable({ apiKey: airtableSettings.apiKey }).base(airtableSettings.base);
}

function findRecords(tableName, options = {}) {
  logger.info({ tableName }, 'Querying Airtable');
  return _airtableClient()
    .table(tableName)
    .select(options)
    .all();
}

async function findRecord(tableName, options = {}) {
  logger.info({ tableName }, 'Querying Airtable for one record');
  const records = await _airtableClient()
    .table(tableName)
    .select({ ...options, maxRecords: 1 })
    .all();
  return records.length > 0 ? records : null;
}

async function createRecord(tableName, body) {
  const records = await _airtableClient()
    .table(tableName)
    .create([body]);
  return records[0];
}

async function updateRecord(tableName, body) {
  const records = await _airtableClient()
    .table(tableName)
    .update([body]);
  return records[0];
}

async function updateRecords(tableName, body) {
  const updatedRecords = [];
  for (const chunkRecords of _.chunk(body, LIMIT_UPDATE_RECORDS_SIZE)) {
    const updatedChunkRecords = await _airtableClient()
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
};
