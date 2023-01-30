const { createRecord, updateRecord, deleteRecord, syncRecordById } = require('./common');
const competenceProxyRepository = require('./competence-proxy-repository');

const TABLE_NAME = 'airtable_thematics';
const AIRTABLE_TABLE_NAME = 'Thematiques';
const HAS_ID_PERSISTANT = false;

module.exports = {
  async createRecord(airtableRecord) {
    await createRecord(airtableRecord, TABLE_NAME, HAS_ID_PERSISTANT);

    const competenceAirtableId = airtableRecord.fields['Competence'][0];
    await competenceProxyRepository.syncRecordById(competenceAirtableId);
  },

  async updateRecord(airtableRecord) { return updateRecord(airtableRecord, TABLE_NAME, HAS_ID_PERSISTANT); },

  async deleteRecord(airtableRecord) { return deleteRecord(airtableRecord, TABLE_NAME, HAS_ID_PERSISTANT); },

  async syncRecordById(airtableId) {
    return syncRecordById(airtableId, TABLE_NAME, AIRTABLE_TABLE_NAME, HAS_ID_PERSISTANT);
  },
};
