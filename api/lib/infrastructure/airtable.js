const Airtable = require('airtable');
const airtableSettings = require('../config').airtable;
const logger = require('./logger');

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
  return records.length > 0 ? records[0] : null;
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

module.exports = {
  findRecords,
  findRecord,
  createRecord,
  updateRecord,
};
