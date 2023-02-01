require('dotenv').config();
const _ = require('lodash');
const { performance } = require('perf_hooks');
const { knex, disconnect } = require('../../db/knex-database-connection');
const logger = require('../../lib/infrastructure/logger');
const airtable = require('../../lib/infrastructure/airtable');
const fieldsToKeep = require('../../lib/infrastructure/airtable_tables_fields_to_keep');

const AIRTABLE_TO_PG_TABLES = {
  'Referentiel': 'airtable_frameworks',
  'Domaines': 'airtable_areas',
  'Competences': 'airtable_competences',
  'Thematiques': 'airtable_thematics',
  'Tubes': 'airtable_tubes',
  'Acquis': 'airtable_skills',
  'Epreuves': 'airtable_challenges',
  'Tests': 'airtable_tests',
  'Tags': 'airtable_tags',
  'Tutoriels': 'airtable_tutorials',
  'Attachments': 'airtable_attachments',
};
const REAL_ID_IN_AIRTABLE = 'id persistant';

const compareTwoRecords = async (airtableTable, id) => {
  const hasIdPersistant = !['Referentiel', 'Thematiques', 'Attachments'].includes(airtableTable);
  const recordFromPG = await knex(AIRTABLE_TO_PG_TABLES[airtableTable]).select('*').where({ id }).first();
  const filterByFormula = hasIdPersistant ? `{id persistant} = "${id}"` : `{Record ID} = "${id}"`;
  const fullRecordFromAirtable =  await airtable.findRecord(airtableTable, { filterByFormula });
  const recordFromAirtable = {
    id: fullRecordFromAirtable.fields?.[REAL_ID_IN_AIRTABLE] || fullRecordFromAirtable.id,
    airtable_id: fullRecordFromAirtable.id,
    fields: _.pick(fullRecordFromAirtable.fields, fieldsToKeep[AIRTABLE_TO_PG_TABLES[airtableTable]]),
  };
  if (!recordFromPG) {
    logger.info('Record not found in PG');
    return;
  }
  if (!recordFromAirtable) {
    logger.info('Record not found in Airtable');
    return;
  }
  logger.info('Are equal ? :', _.isEqual(recordFromPG, recordFromAirtable));
  logger.info('Print PG record');
  _printRecord(recordFromPG);
  logger.info('Print Airtable record');
  _printRecord(recordFromAirtable);
};

const isLaunchedFromCommandLine = require.main === module;

async function main() {
  const startTime = performance.now();
  logger.info(`Script ${__filename} has started`);
  const airtableTable = process.argv[2];
  const id = process.argv[3];
  await compareTwoRecords(airtableTable, id);
  const endTime = performance.now();
  const duration = Math.round(endTime - startTime);
  logger.info(`Script has ended: took ${duration} milliseconds`);
}

(async () => {
  if (isLaunchedFromCommandLine) {
    try {
      await main();
    } catch (error) {
      logger.error(error);
      process.exitCode = 1;
    } finally {
      await disconnect();
    }
  }
})();

module.exports = { compareTwoRecords };

function _printRecord(record) {
  logger.info(`id : ${record.id}`);
  logger.info(`airtable_id : ${record.airtable_id}`);
  const sortedKeys = Object.keys(record.fields).sort();
  for (const key of sortedKeys) {
    logger.info(`${key} : ${record.fields[key]}`);
  }
}
