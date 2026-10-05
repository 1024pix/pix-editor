const AREAS_TABLE_NAME = 'areas';
const COMPETENCES_TABLE_NAME = 'competences';
const THEMATICS_TABLE_NAME = 'thematics';
const TUBES_TABLE_NAME = 'tubes';
const SKILLS_TABLE_NAME = 'skills';
const SKILLS_TUTORIALS_TABLE_NAME = 'skills-tutorials';
const CHALLENGES_TABLE_NAME = 'challenges';
const LOCALIZED_CHALLENGES_TABLE_NAME = 'localized_challenges';
const ATTACHMENTS_TABLE_NAME = 'attachments';
const LOCALIZED_FRAMEWORK_TUBES_TABLE_NAME = 'localized_framework_tubes';
const EXTERNAL_URLS_LOCALIZED_CHALLENGES_TABLE_NAME = 'external_urls-localized_challenges';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.alterTable(AREAS_TABLE_NAME, function(table) {
    table.dropForeign('frameworkId');
    table.string('frameworkId').notNullable().references('frameworks.id').onDelete('CASCADE').alter();
  });
  await knex.schema.alterTable(COMPETENCES_TABLE_NAME, function(table) {
    table.dropForeign('areaId');
    table.string('areaId').notNullable().references('areas.id').onDelete('CASCADE').alter();
  });
  await knex.schema.alterTable(THEMATICS_TABLE_NAME, function(table) {
    table.dropForeign('competenceId');
    table.string('competenceId').notNullable().references('competences.id').onDelete('CASCADE').alter();
  });
  await knex.schema.alterTable(TUBES_TABLE_NAME, function(table) {
    table.dropForeign('thematicId');
    table.string('thematicId').notNullable().references('thematics.id').onDelete('CASCADE').alter();
  });
  await knex.schema.alterTable(SKILLS_TABLE_NAME, function(table) {
    table.dropForeign('tubeId');
    table.string('tubeId').nullable().references('tubes.id').onDelete('CASCADE').alter();
  });
  await knex.schema.alterTable(CHALLENGES_TABLE_NAME, function(table) {
    table.dropForeign('skillId');
    table.string('skillId').nullable().references('skills.id').onDelete('CASCADE').alter();
  });
  await knex.schema.alterTable(SKILLS_TUTORIALS_TABLE_NAME, function(table) {
    table.dropForeign('skillId');
    table.dropPrimary();
  });
  await knex.schema.alterTable(SKILLS_TUTORIALS_TABLE_NAME, function(table) {
    table.string('skillId').notNullable().references('skills.id').onDelete('CASCADE').alter();
    table.primary([
      'skillId',
      'tutorialId',
      'type',
    ]);
  });
  await knex.schema.alterTable(LOCALIZED_CHALLENGES_TABLE_NAME, function(table) {
    table.dropForeign('challengeId');
    table.string('challengeId').notNullable().references('challenges.id').onDelete('CASCADE').alter();
  });
  await knex.schema.alterTable(ATTACHMENTS_TABLE_NAME, function(table) {
    table.dropForeign('challengeId');
    table.string('challengeId').nullable().references('challenges.id').onDelete('SET NULL').alter();
    table.dropForeign('localizedChallengeId');
    table.string('localizedChallengeId').nullable().references('localized_challenges.id').onDelete('SET NULL').alter();
  });
  await knex.schema.alterTable(LOCALIZED_FRAMEWORK_TUBES_TABLE_NAME, function(table) {
    table.dropForeign('tubeId');
    table.string('tubeId').notNullable().references('tubes.id').onDelete('CASCADE').alter();
  });
  await knex.schema.alterTable(EXTERNAL_URLS_LOCALIZED_CHALLENGES_TABLE_NAME, function(table) {
    table.dropForeign('localizedChallengeId');
    table.dropPrimary();
  });
  await knex.schema.alterTable(EXTERNAL_URLS_LOCALIZED_CHALLENGES_TABLE_NAME, function(table) {
    table.string('localizedChallengeId').notNullable().references('localized_challenges.id').onDelete('CASCADE').alter();
    table.primary(['localizedChallengeId', 'externalUrlId']);
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.alterTable(AREAS_TABLE_NAME, function(table) {
    table.dropForeign('frameworkId');
    table.string('frameworkId').notNullable().references('frameworks.id').alter();
  });
  await knex.schema.alterTable(COMPETENCES_TABLE_NAME, function(table) {
    table.dropForeign('areaId');
    table.string('areaId').notNullable().references('areas.id').alter();
  });
  await knex.schema.alterTable(THEMATICS_TABLE_NAME, function(table) {
    table.dropForeign('competenceId');
    table.string('competenceId').notNullable().references('competences.id').alter();
  });
  await knex.schema.alterTable(TUBES_TABLE_NAME, function(table) {
    table.dropForeign('thematicId');
    table.string('thematicId').notNullable().references('thematics.id').alter();
  });
  await knex.schema.alterTable(SKILLS_TABLE_NAME, function(table) {
    table.dropForeign('tubeId');
    table.string('tubeId').nullable().references('tubes.id').alter();
  });
  await knex.schema.alterTable(CHALLENGES_TABLE_NAME, function(table) {
    table.dropForeign('skillId');
    table.string('skillId').nullable().references('skills.id').alter();
  });
  await knex.schema.alterTable(SKILLS_TUTORIALS_TABLE_NAME, function(table) {
    table.dropForeign('skillId');
    table.dropPrimary();
  });
  await knex.schema.alterTable(SKILLS_TUTORIALS_TABLE_NAME, function(table) {
    table.string('skillId').notNullable().references('skills.id').alter();
    table.primary([
      'skillId',
      'tutorialId',
      'type',
    ]);
  });
  await knex.schema.alterTable(LOCALIZED_CHALLENGES_TABLE_NAME, function(table) {
    table.dropForeign('challengeId');
    table.string('challengeId').notNullable().references('challenges.id').alter();
  });
  await knex.schema.alterTable(ATTACHMENTS_TABLE_NAME, function(table) {
    table.dropForeign('challengeId');
    table.string('challengeId').notNullable().references('challenges.id').alter();
  });
  await knex.schema.alterTable(LOCALIZED_FRAMEWORK_TUBES_TABLE_NAME, function(table) {
    table.dropForeign('tubeId');
    table.string('tubeId').notNullable().references('tubes.id').alter();
  });
  await knex.schema.alterTable(EXTERNAL_URLS_LOCALIZED_CHALLENGES_TABLE_NAME, function(table) {
    table.dropForeign('localizedChallengeId');
    table.dropPrimary();
  });
  await knex.schema.alterTable(EXTERNAL_URLS_LOCALIZED_CHALLENGES_TABLE_NAME, function(table) {
    table.string('localizedChallengeId').notNullable().references('localized_challenges.id').alter();
    table.primary(['localizedChallengeId', 'externalUrlId']);
  });
}
