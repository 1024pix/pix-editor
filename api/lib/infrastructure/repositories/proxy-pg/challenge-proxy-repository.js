const { createRecord, updateRecord, deleteRecord, syncRecordById } = require('./common');
const skillProxyRepository = require('./skill-proxy-repository');

const TABLE_NAME = 'airtable_challenges';
const AIRTABLE_TABLE_NAME = 'Epreuves';
const HAS_ID_PERSISTANT = true;

module.exports = {
  async createRecord(airtableRecord) {
    await createRecord(airtableRecord, TABLE_NAME, HAS_ID_PERSISTANT);

    const skillAirtableId = airtableRecord.fields['Acquix'][0];
    await skillProxyRepository.syncRecordById(skillAirtableId);
  },

  async updateRecord(airtableRecord) { return updateRecord(airtableRecord, TABLE_NAME, HAS_ID_PERSISTANT); },

  async deleteRecord(airtableRecord) { return deleteRecord(airtableRecord, TABLE_NAME, HAS_ID_PERSISTANT); },

  async syncRecordById(airtableId) {
    return syncRecordById(airtableId, TABLE_NAME, AIRTABLE_TABLE_NAME, HAS_ID_PERSISTANT);
  },
};
