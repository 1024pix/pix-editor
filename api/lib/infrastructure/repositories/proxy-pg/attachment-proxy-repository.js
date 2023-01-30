const { createRecord, updateRecord, deleteRecord, syncRecordById } = require('./common');

const TABLE_NAME = 'airtable_attachments';
const AIRTABLE_TABLE_NAME = 'Attachments';
const HAS_ID_PERSISTANT = false;

module.exports = {
  async createRecord(airtableRecord) {
    await createRecord(airtableRecord, TABLE_NAME, HAS_ID_PERSISTANT);

    // TODO should I refresh challenges ? or the other way around ?
  },

  async updateRecord(airtableRecord) { return updateRecord(airtableRecord, TABLE_NAME, HAS_ID_PERSISTANT); },

  async deleteRecord(airtableRecord) { return deleteRecord(airtableRecord, TABLE_NAME, HAS_ID_PERSISTANT); },

  async syncRecordById(airtableId) {
    return syncRecordById(airtableId, TABLE_NAME, AIRTABLE_TABLE_NAME, HAS_ID_PERSISTANT);
  },
};
