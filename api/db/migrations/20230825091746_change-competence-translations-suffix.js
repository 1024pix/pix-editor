const TABLE_NAME = 'translations';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex(TABLE_NAME)
    .whereLike('key', 'competence.%.title')
    .update({ key: knex.raw('regexp_replace (key, \'\\.title$\', \'.name\')') });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex(TABLE_NAME)
    .whereLike('key', 'competence.%.name')
    .update({ key: knex.raw('regexp_replace (key, \'\\.name$\', \'.title\')') });
}
