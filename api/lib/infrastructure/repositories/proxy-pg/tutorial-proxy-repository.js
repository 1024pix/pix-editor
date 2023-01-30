const { createRecord, updateRecord, deleteRecord, syncRecordById } = require('./common');
const tagProxyRepository = require('./tag-proxy-repository');

const TABLE_NAME = 'airtable_tutorials';
const AIRTABLE_TABLE_NAME = 'Tutoriels';
const HAS_ID_PERSISTANT = true;

module.exports = {
  async createRecord(airtableRecord) {
    await createRecord(airtableRecord, TABLE_NAME, HAS_ID_PERSISTANT);

    for (const tagAirtableId of airtableRecord.fields['Tags']) {
      await tagProxyRepository.syncRecordById(tagAirtableId);
    }
  },

  async updateRecord(airtableRecord) { return updateRecord(airtableRecord, TABLE_NAME, HAS_ID_PERSISTANT); },

  async deleteRecord(airtableRecord) { return deleteRecord(airtableRecord, TABLE_NAME, HAS_ID_PERSISTANT); },

  async syncRecordById(airtableId) {
    return syncRecordById(airtableId, TABLE_NAME, AIRTABLE_TABLE_NAME, HAS_ID_PERSISTANT);
  },
};
