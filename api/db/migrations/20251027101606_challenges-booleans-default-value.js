const TABLE_NAME = 'challenges';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.alterTable(TABLE_NAME, function(table) {
    table.boolean('t1Status').notNullable().defaultTo(false).alter();
    table.boolean('t2Status').notNullable().defaultTo(false).alter();
    table.boolean('t3Status').notNullable().defaultTo(false).alter();
    table.boolean('autoReply').notNullable().defaultTo(false).alter();
    table.boolean('focusable').notNullable().defaultTo(false).alter();
    table.boolean('shuffled').notNullable().defaultTo(false).alter();
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down() {
  // no down
}
