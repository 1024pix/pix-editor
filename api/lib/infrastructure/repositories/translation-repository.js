const { knex } = require('../../../db/knex-database-connection');

module.exports = {
  save,
  listByPrefix,
  list,
};

async function save(translations) {
  if (translations.length > 0) {
    return knex('translations')
      .insert(translations)
      .onConflict(['key', 'locale'])
      .merge();
  }
}

async function listByPrefix(prefix) {
  return knex('translations')
    .select()
    .whereLike('key', `${prefix}%`);
}

async function list() {
  return knex('translations').select();
}
