const TABLE_NAME = 'translations';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.raw(`
    ALTER TABLE "translations"
    ADD COLUMN "model" text NOT NULL
    GENERATED ALWAYS AS (REGEXP_REPLACE("key", '^([^\\.]+)\\..+', '\\1')) STORED;
  `);
  await knex.schema.raw(`
    ALTER TABLE "translations"
    ADD COLUMN "entityId" text NOT NULL
    GENERATED ALWAYS AS (REGEXP_REPLACE("key", '^[^\\.]+\\.([^\\.]+)\\..+', '\\1')) STORED;
  `);
  await knex.schema.table('translations', (table) => {
    table.index(['model', 'entityId']);
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.table(TABLE_NAME, (table) => {
    table.dropIndex(['model', 'entityId']);
    table.dropColumn('entityId');
    table.dropColumn('model');
  });
}
