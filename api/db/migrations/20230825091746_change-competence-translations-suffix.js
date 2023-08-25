const TABLE_NAME = 'translations';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  await knex(TABLE_NAME)
    .whereLike('key', 'competence.%.title')
    .update({ key: knex.raw('regexp_replace (key, \'\\.title$\', \'.name\')') });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  await knex(TABLE_NAME)
    .whereLike('key', 'competence.%.name')
    .update({ key: knex.raw('regexp_replace (key, \'\\.name$\', \'.title\')') });
};
