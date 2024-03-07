import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';
import Airtable from 'airtable';
import { logger } from '../../lib/infrastructure/logger.js';
import { performance } from 'node:perf_hooks';
import _ from 'lodash';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const isLaunchedFromCommandLine = process.argv[1] === __filename;

const MAX_RECORDS_ALLOWED = 10;

export async function deleteUnreferencedTranslationsInAirtable({ dryRun = true, airtableClient }) {
  const translations = await airtableClient
    .table('translations')
    .select()
    .all();

  const competences =  await airtableClient
    .table('Competences')
    .select()
    .all();

  const areas = await airtableClient
    .table('Domaines')
    .select()
    .all();

  const challenges = await airtableClient
    .table('Epreuves')
    .select()
    .all();

  const skills = await airtableClient
    .table('Acquis')
    .select()
    .all();

  const translationKeys = translations.map(({ fields }) => fields.key);
  const baseKeys = [
    ...competences.map(({ fields }) => `competence.${fields['id persistant']}`),
    ...areas.map(({ fields }) => `area.${fields['id persistant']}`),
    ...challenges.map(({ fields }) => `challenge.${fields['id persistant']}`),
    ...skills.map(({ fields }) => `skill.${fields['id persistant']}`),
  ];

  const unreferenced = _.differenceWith(translationKeys, baseKeys, (translation, baseKey) => {
    return translation.startsWith(baseKey);
  });

  const translationsToDelete = translations
    .filter((translation) => {
      return unreferenced.includes(translation.fields.key);
    })
    .map(({ id }) => id);

  if (!dryRun) {
    logger.info(`About to delete ${translationsToDelete.length} translations`);

    for (const translationsToDeleteChunk of _.chunk(translationsToDelete, MAX_RECORDS_ALLOWED)) {
      await airtableClient.table('translations').destroy(translationsToDeleteChunk);
    }
  } else {
    logger.info(`${translationsToDelete.length} translations would have been deleted if dryRun disabled.`);
  }
}

async function main() {
  const startTime = performance.now();
  logger.info(`Script ${__filename} has started`);
  const dryRun = process.env.DRY_RUN !== 'false';

  if (dryRun) logger.warn('Dry run: no actual modification will be performed, use DRY_RUN=false to disable');
  const airtableClient = new Airtable({
    apiKey: process.env.AIRTABLE_API_KEY,
  }).base(process.env.AIRTABLE_BASE);

  await deleteUnreferencedTranslationsInAirtable({ dryRun, airtableClient });
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
    }
  }
})();
