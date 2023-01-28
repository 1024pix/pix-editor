const TABLE_NAMES = [
  'airtable_frameworks',
  'airtable_areas',
  'airtable_competences',
  'airtable_thematics',
  'airtable_tubes',
  'airtable_skills',
  'airtable_challenges',
  'airtable_tests',
  'airtable_tutorials',
  'airtable_tags',
  'airtable_attachments',
];

exports.up = async function(knex) {

  function genericAirtableTableSchema(t) {
    t.string('id').primary();
    t.string('airtable_id');
    t.jsonb('fields').notNullable();
    t.dateTime('created_at').notNullable().defaultTo(knex.fn.now());
    t.dateTime('updated_at').notNullable().defaultTo(knex.fn.now());
  }

  for (const tableName of TABLE_NAMES) await knex.schema.createTable(tableName, genericAirtableTableSchema);
};

exports.down = async function(knex) {
  for (const tableName of TABLE_NAMES) await knex.schema.dropTable(tableName);
};

