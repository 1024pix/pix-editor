const { knex } = require('../../../db/knex-database-connection');

module.exports = {
  save,
};

async function save({ key, value, locale }) {
  const serializedTranslationForDB = {
    key,
    locale,
    value,
  };
  await knex('translations')
    .insert(serializedTranslationForDB);

  return serializedTranslationForDB.id;
}
