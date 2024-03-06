import _ from 'lodash';
import dotenv from 'dotenv';
import { performance } from 'node:perf_hooks';
import { fileURLToPath } from 'node:url';
import { disconnect, knex } from '../../db/knex-database-connection.js';
import { logger } from '../../lib/infrastructure/logger.js';
import { parseFile } from 'fast-csv';
import { streamToPromiseArray } from '../../lib/infrastructure/utils/stream-to-promise.js';

dotenv.config();
const TAG_LABEL_MAX_LENGTH = 30;

function removeCapitalizeAndDiacritics(str) {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}

async function readCsvFile(csvFilePath) {
  const [data] = await streamToPromiseArray(parseFile(csvFilePath, { delimiter: ',', headers: false }));
  return data;
}

async function checkDuplicatesInDB(tagLabelsToInsert) {
  const uniqueTagLabelsToInsert = [];
  const existingTags = await knex('static_course_tags').select('id', 'label');
  for (const tagLabel of tagLabelsToInsert) {
    const alreadyExistingTag = existingTags.find(({ label }) => removeCapitalizeAndDiacritics(label) === removeCapitalizeAndDiacritics(tagLabel));
    if (!alreadyExistingTag) {
      uniqueTagLabelsToInsert.push(tagLabel);
    }
    else {
      logger.warn(`Tag "${tagLabel}" to insert is too similar to tag in DB (id|label) : ${alreadyExistingTag.id}|${alreadyExistingTag.label}`);
    }
  }
  return uniqueTagLabelsToInsert;
}

async function checkDuplicatesInCSV(tagLabelsToInsert) {
  const uniqueTagLabelsToInsert = [];
  const similarGroupTags = [];
  for (const currentTagLabel of tagLabelsToInsert) {
    const similarTags = tagLabelsToInsert.filter((tagLabel) => removeCapitalizeAndDiacritics(currentTagLabel) === removeCapitalizeAndDiacritics(tagLabel));
    if (similarTags.length > 1) { // myself and more
      similarGroupTags.push(similarTags);
    }
    else {
      uniqueTagLabelsToInsert.push(currentTagLabel);
    }
  }
  if (similarGroupTags.length > 0) {
    const uniqGroupTags = _.uniqBy(similarGroupTags, (content) => content.join(''));
    for (const group of uniqGroupTags) {
      logger.warn(`These tags are too similar to each other : ${group.join(', ')}`);
    }
  }
  return uniqueTagLabelsToInsert;
}

async function checkIfTagTooLong(tagLabelsToInsert) {
  const goodSizeTagLabelsToInsert = [];
  for (const tagToCheck of tagLabelsToInsert) {
    if (tagToCheck.length > TAG_LABEL_MAX_LENGTH) {
      logger.warn(`This tag is too long, it wont be inserted in DB: ${tagToCheck}`);
    } else {
      goodSizeTagLabelsToInsert.push(tagToCheck);
    }
  }
  return goodSizeTagLabelsToInsert;
}

export async function addTagsFromCSVFile({ dryRun, tagLabelsToInsert } = {}) {
  logger.info(`${tagLabelsToInsert.length} found in file : ${tagLabelsToInsert.join(', ')}`);
  let uniqTags = await checkDuplicatesInDB(tagLabelsToInsert);
  uniqTags = await checkDuplicatesInCSV(uniqTags);
  uniqTags = await checkIfTagTooLong(uniqTags);
  logger.info(`About to insert ${uniqTags.length} tags`);

  if (uniqTags.length === 0) {
    logger.info('No tags to insert.');
    return;
  }
  if (!dryRun) {
    const insertion = await knex('static_course_tags').insert(uniqTags.map((tagLabel)=> ({ label: tagLabel })), ['label']);
    logger.info(`${insertion.length} tags inserted : ${insertion.map(({ label }) => label).join(', ')}`);
  } else {
    logger.info(`${uniqTags.length} tags would have been inserted.`);
  }
}

async function main() {
  const startTime = performance.now();
  logger.info(`Script ${__filename} has started`);

  const dryRun = process.env.DRY_RUN !== 'false';

  if (dryRun) logger.warn('Dry run: no actual modification will be performed, use DRY_RUN=false to disable');

  const csvPath = process.argv[2];
  const csvContent = await readCsvFile(csvPath);
  await addTagsFromCSVFile({ dryRun, tagLabelsToInsert: csvContent });
  const endTime = performance.now();
  const duration = Math.round(endTime - startTime);
  logger.info(`Script has ended: took ${duration} milliseconds`);
}

const __filename = fileURLToPath(import.meta.url);
const isLaunchedFromCommandLine = process.argv[1] === __filename;

if (isLaunchedFromCommandLine) {
  main().catch((error) => {
    logger.error(error);
    process.exitCode = 1;
  }).finally(async () => {
    await disconnect();
  });
}
