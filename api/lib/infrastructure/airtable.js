const Airtable = require('airtable');
const airtableSettings = require('../config').airtable;
const logger = require('./logger');

function _airtableClient() {
  return new Airtable({ apiKey: airtableSettings.apiKey }).base(airtableSettings.databaseId);
}

function findRecords(tableName, options = {}) {
  logger.info({ tableName }, 'Querying Airtable');
  return _airtableClient()
    .table(tableName)
    .select(options)
    .all();
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
  createRecord,
  updateRecord,
};
