const Airtable = require('airtable');
const airtableSettings = require('../config').airtable;
const logger = require('./logger');
const _ = require('lodash');

function _airtableClient() {
  return new Airtable({ apiKey: airtableSettings.apiKey }).base(airtableSettings.base);
}

function findRecords(tableName, fields) {
  logger.info({ tableName }, 'Querying Airtable');
  return _airtableClient()
    .table(tableName)
    .select(fields ? { fields } : {})
    .all();
}

module.exports = {
  findRecords,
};
