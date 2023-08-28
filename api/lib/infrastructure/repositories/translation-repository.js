const { knex } = require('../../../db/knex-database-connection');
const config = require('../../config');
const translationDatasource = require('../datasources/airtable/translation-datasource');

module.exports = {
  save,
  listByPrefix,
  list,
};

async function save(translations) {
  if (translations.length === 0) return [];

  const savedTranslations = await knex('translations')
    .insert(translations)
    .onConflict(['key', 'locale'])
    .merge();

  if (config.airtable.saveTranslations) {
    await translationDatasource.upsert(translations);
  }

  return savedTranslations;
}

async function listByPrefix(prefix) {
  return knex('translations')
    .select()
    .whereLike('key', `${prefix}%`);
}

async function list() {
  return knex('translations').select();
}
