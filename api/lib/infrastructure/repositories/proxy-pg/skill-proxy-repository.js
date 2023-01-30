const { createRecord, updateRecord, deleteRecord, syncRecordById } = require('./common');
const tubeProxyRepository = require('./tube-proxy-repository');
const tagProxyRepository = require('./tag-proxy-repository');

const TABLE_NAME = 'airtable_skills';
const AIRTABLE_TABLE_NAME = 'Acquis';
const HAS_ID_PERSISTANT = true;

module.exports = {
  async createRecord(airtableRecord) {
    await createRecord(airtableRecord, TABLE_NAME, HAS_ID_PERSISTANT);

    const tubeAirtableId = airtableRecord.fields['Tube'][0];
    await tubeProxyRepository.syncRecordById(tubeAirtableId);

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
