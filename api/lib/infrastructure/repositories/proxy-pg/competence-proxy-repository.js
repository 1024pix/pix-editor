const { createRecord, updateRecord, deleteRecord, syncRecordById } = require('./common');
const areaProxyRepository = require('./area-proxy-repository');

const TABLE_NAME = 'airtable_competences';
const AIRTABLE_TABLE_NAME = 'Competences';
const HAS_ID_PERSISTANT = true;

module.exports = {
  async createRecord(airtableRecord) {
    await createRecord(airtableRecord, TABLE_NAME, HAS_ID_PERSISTANT);

    const areaAirtableId = airtableRecord.fields['Domaine'][0];
    await areaProxyRepository.syncRecordById(areaAirtableId);
  },

  async updateRecord(airtableRecord) { return updateRecord(airtableRecord, TABLE_NAME, HAS_ID_PERSISTANT); },

  async deleteRecord(airtableRecord) { return deleteRecord(airtableRecord, TABLE_NAME, HAS_ID_PERSISTANT); },

  async syncRecordById(airtableId) {
    return syncRecordById(airtableId, TABLE_NAME, AIRTABLE_TABLE_NAME, HAS_ID_PERSISTANT);
  },
};
