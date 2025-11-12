/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.alterTable('areas', (table) => {
    table.index('frameworkId');
  });

  await knex.schema.alterTable('competences', (table) => {
    table.index('areaId');
  });

  await knex.schema.alterTable('thematics', (table) => {
    table.index('competenceId');
  });

  await knex.schema.alterTable('tubes', (table) => {
    table.index('thematicId');
  });

  await knex.schema.alterTable('skills', (table) => {
    table.index('tubeId');
  });

  await knex.schema.alterTable('skills-tutorials', (table) => {
    table.index('skillId', 'type');
  });

  await knex.schema.alterTable('tutorials-tutorial_tags', (table) => {
    table.index('tutorialId');
  });

  await knex.schema.alterTable('challenges', (table) => {
    table.index('skillId');
  });

  await knex.schema.alterTable('attachments', (table) => {
    table.index('challengeId', 'localizedChallengeId');
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.alterTable('areas', (table) => {
    table.dropIndex('frameworkId');
  });

  await knex.schema.alterTable('competences', (table) => {
    table.dropIndex('areaId');
  });

  await knex.schema.alterTable('thematics', (table) => {
    table.dropIndex('competenceId');
  });

  await knex.schema.alterTable('tubes', (table) => {
    table.dropIndex('thematicId');
  });

  await knex.schema.alterTable('skills', (table) => {
    table.dropIndex('tubeId');
  });

  await knex.schema.alterTable('skills-tutorials', (table) => {
    table.dropIndex('skillId', 'type');
  });

  await knex.schema.alterTable('tutorials-tutorial_tags', (table) => {
    table.dropIndex('tutorialId');
  });

  await knex.schema.alterTable('challenges', (table) => {
    table.dropIndex('skillId');
  });

  await knex.schema.alterTable('attachments', (table) => {
    table.dropIndex('challengeId', 'localizedChallengeId');
  });
}
