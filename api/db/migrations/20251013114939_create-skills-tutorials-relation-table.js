const TABLE_NAME = 'skills-tutorials';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.createTable(TABLE_NAME, function(table) {
    table.string('skillId').notNullable().references('skills.id');
    table.string('tutorialId').notNullable().references('tutorials.id');
    table.string('type').checkIn(['understanding', 'learningMore']).notNullable();
    table.primary(['tutorialId', 'skillId', 'type']);
    table.timestamps(true, true, true);
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.dropTable(TABLE_NAME);
}
