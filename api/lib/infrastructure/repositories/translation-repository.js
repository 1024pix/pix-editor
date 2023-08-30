const { knex } = require('../../../db/knex-database-connection');
const translationDatasource = require('../datasources/airtable/translation-datasource');

module.exports = {
  save,
  listByPrefix,
  list,
  checkIfShouldDuplicateToAirtable,
};

let _shouldDuplicateToAirtable;
let _shouldDuplicateToAirtablePromise;

async function save(translations) {
  if (translations.length === 0) return [];

  const savedTranslations = await knex('translations')
    .insert(translations)
    .onConflict(['key', 'locale'])
    .merge();

  if (_shouldDuplicateToAirtable == null && _shouldDuplicateToAirtablePromise == null) {
    await checkIfShouldDuplicateToAirtable();
  }

  if (_shouldDuplicateToAirtable) {
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

async function checkIfShouldDuplicateToAirtable() {
  _shouldDuplicateToAirtablePromise = translationDatasource.exists();
  _shouldDuplicateToAirtable = await _shouldDuplicateToAirtablePromise;
}
