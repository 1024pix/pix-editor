const { createRecord, updateRecord, deleteRecord, syncRecordById } = require('./common');
const competenceProxyRepository = require('./competence-proxy-repository');
const thematicProxyRepository = require('./thematic-proxy-repository');

const TABLE_NAME = 'airtable_tubes';
const AIRTABLE_TABLE_NAME = 'Tubes';
const HAS_ID_PERSISTANT = true;

module.exports = {
  async createRecord(airtableRecord) {
    await createRecord(airtableRecord, TABLE_NAME, HAS_ID_PERSISTANT);

    const competenceAirtableId = airtableRecord.fields['Competences'][0];
    await competenceProxyRepository.syncRecordById(competenceAirtableId);

    const thematicAirtableId = airtableRecord.fields['Thematique'][0];
    await thematicProxyRepository.syncRecordById(thematicAirtableId);
  },

  async updateRecord(airtableRecord) { return updateRecord(airtableRecord, TABLE_NAME, HAS_ID_PERSISTANT); },

  async deleteRecord(airtableRecord) { return deleteRecord(airtableRecord, TABLE_NAME, HAS_ID_PERSISTANT); },

  async syncRecordById(airtableId) {
    return syncRecordById(airtableId, TABLE_NAME, AIRTABLE_TABLE_NAME, HAS_ID_PERSISTANT);
  },
};
