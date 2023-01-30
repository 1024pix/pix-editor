const { createRecord, updateRecord, deleteRecord, syncRecordById } = require('./common');

const TABLE_NAME = 'airtable_frameworks';
const AIRTABLE_TABLE_NAME = 'Referentiel';
const HAS_ID_PERSISTANT = false;

module.exports = {
  async createRecord(airtableRecord) {
    return createRecord(airtableRecord, TABLE_NAME, HAS_ID_PERSISTANT);
  },

  async updateRecord(airtableRecord) { return updateRecord(airtableRecord, TABLE_NAME, HAS_ID_PERSISTANT); },

  async deleteRecord(airtableRecord) { return deleteRecord(airtableRecord, TABLE_NAME, HAS_ID_PERSISTANT); },

  async syncRecordById(airtableId) {
    return syncRecordById(airtableId, TABLE_NAME, AIRTABLE_TABLE_NAME, HAS_ID_PERSISTANT);
  },
};
