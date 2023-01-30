const _ = require('lodash');
const { knex } = require('../../../../db/knex-database-connection');
const fieldsToKeep = require('../../airtable_tables_fields_to_keep');
const airtable = require('../../airtable');

module.exports = {
  async createRecord(airtableRecord, pgTableName, hasIdPersistant) {
    const airtable_id = airtableRecord.id;
    const airtable_fields = airtableRecord.fields;
    const dataToInsert = {
      id: hasIdPersistant ? airtable_fields['id persistant'] : airtable_id,
      airtable_id,
      fields: JSON.stringify(_.pick(airtable_fields, fieldsToKeep[pgTableName])),
    };
    await knex(pgTableName).insert(dataToInsert);
  },

  async updateRecord(airtableRecord, pgTableName, hasIdPersistant) {
    return _update(airtableRecord, pgTableName, hasIdPersistant);
  },

  async deleteRecord(airtableRecord, pgTableName, hasIdPersistant) {
    const id = hasIdPersistant ? airtableRecord.fields['id persistant'] : airtableRecord.id;
    await knex(pgTableName).delete().where({ id });
  },

  async syncRecordById(airtableId, pgTableName, airtableTableName, hasIdPersistant) {
    const airtableRecord = await airtable.findRecord(airtableTableName, {
      filterByFormula: `{Record ID} = "${airtableId}"`,
    });
    return _update(airtableRecord, pgTableName, hasIdPersistant);
  }
};

async function _update(airtableRecord, pgTableName, hasIdPersistant) {
  const id = hasIdPersistant ? airtableRecord.fields['id persistant'] : airtableRecord.id;
  const dataToUpdate = {
    fields: JSON.stringify(_.pick(airtableRecord.fields, fieldsToKeep[pgTableName])),
    updated_at: new Date(),
  };
  await knex(pgTableName).update(dataToUpdate).where({ id });
}
