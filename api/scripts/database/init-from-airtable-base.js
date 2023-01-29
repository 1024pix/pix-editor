require('dotenv').config();
const _ = require('lodash');
const { performance } = require('perf_hooks');
const { knex, disconnect } = require('../../db/knex-database-connection');
const logger = require('../../lib/infrastructure/logger');
const airtable = require('../../lib/infrastructure/airtable');
const fieldsToKeep = require('../../lib/infrastructure/airtable_tables_fields_to_keep');

// Referentiel, Thematiques et Attachments n'ont pas d'id persistant ?

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

const copyLearningContentFromAirtableToPg = async () => {
  const trx = await knex.transaction();
  try {
    for (const [airtableTable, pgTable] of Object.entries(AIRTABLE_TO_PG_TABLES)) {
      logger.info(`Copying ${airtableTable} into ${pgTable}`);
      await knex(pgTable).delete();
      const airtableRawObjects = await airtable.findRecords(airtableTable);
      const dataToInsert = airtableRawObjects.map((item) => ({
        id: item.fields?.[REAL_ID_IN_AIRTABLE] || item.id,
        airtable_id: item.id,
        fields: JSON.stringify(_.pick(item.fields, fieldsToKeep[pgTable])),
      }));
      await trx.batchInsert(pgTable, dataToInsert);
    }
    await trx.commit();
  } catch (err) {
    await trx.rollback();
    throw err;
  }
};

const isLaunchedFromCommandLine = require.main === module;

async function main() {
  const startTime = performance.now();
  logger.info(`Script ${__filename} has started`);
  await copyLearningContentFromAirtableToPg();
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

module.exports = { copyLearningContentFromAirtableToPg };
