const { createRecord, updateRecord, deleteRecord, syncRecordById } = require('./common');
const frameworkProxyRepository = require('./framework-proxy-repository');

const TABLE_NAME = 'airtable_areas';
const AIRTABLE_TABLE_NAME = 'Domaines';
const HAS_ID_PERSISTANT = true;

module.exports = {
  async createRecord(airtableRecord) {
    await createRecord(airtableRecord, TABLE_NAME, HAS_ID_PERSISTANT);

    const frameworkAirtableId = airtableRecord.fields['Referentiel'][0];
    await frameworkProxyRepository.syncRecordById(frameworkAirtableId);
  },

  async updateRecord(airtableRecord) { return updateRecord(airtableRecord, TABLE_NAME, HAS_ID_PERSISTANT); },

  async deleteRecord(airtableRecord) { return deleteRecord(airtableRecord, TABLE_NAME, HAS_ID_PERSISTANT); },

  async syncRecordById(airtableId) {
    return syncRecordById(airtableId, TABLE_NAME, AIRTABLE_TABLE_NAME, HAS_ID_PERSISTANT);
  },
};
