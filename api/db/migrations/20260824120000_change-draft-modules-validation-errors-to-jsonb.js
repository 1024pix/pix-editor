const TABLE_NAME = 'draft-modules';
const COLUMN_NAME = 'validationErrors';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.raw(`
    ALTER TABLE "${TABLE_NAME}"
    ALTER COLUMN "${COLUMN_NAME}" TYPE jsonb USING NULL
  `);
  await knex.raw(`
    COMMENT ON COLUMN "${TABLE_NAME}"."${COLUMN_NAME}" IS 'List validation errors ({ message, isSchemaError }) if draft module is invalid'
  `);
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.raw(`
    ALTER TABLE "${TABLE_NAME}"
    ALTER COLUMN "${COLUMN_NAME}" TYPE text[] USING NULL
  `);
  await knex.raw(`
    COMMENT ON COLUMN "${TABLE_NAME}"."${COLUMN_NAME}" IS 'List validation errors if draft module is invalid'
  `);
}
