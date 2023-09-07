const { knex } = require('../../../db/knex-database-connection');
const translationDatasource = require('../datasources/airtable/translation-datasource');
const Translation = require('../../domain/models/Translation');

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

  await knex('translations')
    .insert(translations)
    .onConflict(['key', 'locale'])
    .merge();

  if (_shouldDuplicateToAirtable == null && _shouldDuplicateToAirtablePromise == null) {
    await checkIfShouldDuplicateToAirtable();
  }

  if (_shouldDuplicateToAirtable) {
    await translationDatasource.upsert(translations);
  }
}

async function listByPrefix(prefix) {
  const translationDtos = await knex('translations')
    .select()
    .whereLike('key', `${prefix}%`);
  return translationDtos.map(_toDomain);
}

async function list() {
  const translationDtos = await knex('translations').select();
  return translationDtos.map(_toDomain);
}

async function checkIfShouldDuplicateToAirtable() {
  _shouldDuplicateToAirtablePromise = translationDatasource.exists();
  _shouldDuplicateToAirtable = await _shouldDuplicateToAirtablePromise;
}

function _toDomain(dto) {
  return new Translation(dto);
}
