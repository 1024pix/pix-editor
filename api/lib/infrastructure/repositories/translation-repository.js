const { knex } = require('../../../db/knex-database-connection');

module.exports = {
  save,
};

async function save(translations) {
  if (translations.length > 0) {
    return knex('translations')
      .insert(translations)
      .onConflict(['key', 'locale'])
      .merge();
  }
}
