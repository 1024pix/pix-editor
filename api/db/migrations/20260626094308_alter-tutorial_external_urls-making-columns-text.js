const TABLE_NAME = 'tutorial_external_urls';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.alterTable(TABLE_NAME, function(table) {
    table.text('competence_name').notNullable().alter();
    table.text('skill_name').notNullable().alter();
    table.text('tutorial_id').notNullable().alter();
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down() {
  // Pas d'utilité, aucun breaking change entre VARCHAR et TEXT
}
