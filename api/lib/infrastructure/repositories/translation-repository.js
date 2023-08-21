const { knex } = require('../../../db/knex-database-connection');

module.exports = {
  save,
};

async function save({ key, value, lang }) {
  const serializedTranslationForDB = {
    key,
    lang,
    value,
  };
  await knex('translations')
    .insert(serializedTranslationForDB);

  return serializedTranslationForDB.id;
}
