const _ = require('lodash');
const { knex, disconnect } = require('../../../db/knex-database-connection');
const logger = require('../../../lib/infrastructure/logger');
const airtable = require('../../../lib/infrastructure/airtable');
const fieldsToKeep = require('../../../lib/infrastructure/airtable_tables_fields_to_keep');

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
const LOGS = [];
const DIFFLOG_TABLE = 'difflog';

module.exports = async function() {
  for (const [airtableTable, pgTable] of Object.entries(AIRTABLE_TO_PG_TABLES)) {
    logger.info(`Comparing ${airtableTable} and ${pgTable}`);
    const airtableRawObjects = await airtable.findRecords(airtableTable);
    const airtableObjects = airtableRawObjects.map((item) => ({
      id: item.fields?.[REAL_ID_IN_AIRTABLE] || item.id,
      airtable_id: item.id,
      fields: _.pick(item.fields, fieldsToKeep[pgTable]),
    }));
    const pgObjects = await knex(pgTable).select(['id', 'airtable_id', 'fields']);
    const airtableIds = airtableObjects.map((item) => item.id);
    const pgIds = pgObjects.map((item) => item.id);
    const inAirtableNotInPg = _.difference(airtableIds, pgIds);
    const inPgNotInAirtable = _.difference(airtableIds, pgIds);
    if (inAirtableNotInPg.length > 0) _logDiff(`Table(${airtableTable}) - Records in Airtable only : ${inAirtableNotInPg.join(', ')}`);
    if (inPgNotInAirtable.length > 0) _logDiff(`Table(${airtableTable}) - Records in PG only : ${inAirtableNotInPg.join(', ')}`);
    const differentRecordIds = [];
    const commonIds = _.intersection(airtableIds, pgIds);
    for (const id  of commonIds) {
      const airtableRecord = airtableObjects.find((item) => item.id === id);
      const pgRecord = pgObjects.find((item) => item.id === id);
      if (!_.isEqual(airtableRecord, pgRecord)) differentRecordIds.push(id);
    }
    if (differentRecordIds.length > 0) _logDiff(`Table(${airtableTable}) - Different records : ${differentRecordIds.join(', ')}`);
  }
  await knex(DIFFLOG_TABLE).insert({ logtext: LOGS.join('\n') });
};

function _logDiff(text) {
  logger.info(text);
  LOGS.push(text);
}

async function exitOnSignal(signal) {
  logger.info(`Processor received signal ${signal}. Closing DB connections before exiting.`);
  try {
    await disconnect();
    process.exit(0);
  } catch (err) {
    logger.error(err);
    process.exit(1);
  }
}

process.on('SIGTERM', () => { exitOnSignal('SIGTERM'); });
process.on('SIGINT', () => { exitOnSignal('SIGINT'); });
