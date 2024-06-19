import { Configuration, LocalesApi, UploadsApi } from 'phrase-js';
import { Challenge } from '../../lib/domain/models/index.js';
import _ from 'lodash';
import { PassThrough, pipeline, Readable } from 'node:stream';
import csv from 'fast-csv';
import { logger } from '../../lib/infrastructure/logger.js';
import { streamToPromise } from '../../lib/infrastructure/utils/stream-to-promise.js';
import * as config from '../../lib/config.js';
import Airtable from 'airtable';
import { disconnect, knex } from '../../db/knex-database-connection.js';
import { fileURLToPath } from 'node:url';
import {
  challengeRepository,
  releaseRepository,
  skillRepository,
  translationRepository
} from '../../lib/infrastructure/repositories/index.js';

export async function uploadToPhrase() {
  const releaseId = await releaseRepository.create();
  const release = await  releaseRepository.getRelease(releaseId);

  const clonedSkillsIdsChallengesIds = await knex('focus_phrase').select('*');

  // type // persistante ID //
  const clonedPersistantIds = clonedSkillsIdsChallengesIds.map(({ persistantId }) => persistantId);

  const challenges = (await challengeRepository.list()).filter(({ id }) => clonedPersistantIds.includes(id));
  const skills = (await skillRepository.list()).filter(({ id }) => clonedPersistantIds.includes(id));

  const phraseApi = { Configuration, LocalesApi, UploadsApi };
  const releaseContent = Object.fromEntries(
    Object.entries(release.content)
      .map(([collection, entities]) => [
        collection,
        Object.fromEntries(entities.map((entity) => [entity.id, entity])),
      ]),
  );
  const translations =  await translationRepository.list();
  const translationSkills = translations.filter(({ key })=> {
    return skills.find(({ id })=> {
      const regex = new RegExp(`skill\\.${id}\\..+`, 'g');
      return !!key.match(regex);
    });
  });
  const valideChallengesWithFRPrimaryOnly = challenges.filter((challenge) => challenge.primaryLocale === 'fr' && challenge.status === Challenge.STATUSES.VALIDE);
  const translationChallenges = translations.filter(({ key })=> {
    return valideChallengesWithFRPrimaryOnly.find(({ id })=> {
      const regex = new RegExp(`challenge\\.${id}\\..+`, 'g');
      return !!key.match(regex);
    });
  });
  const sortedLocales = _.uniq([...translationSkills.map(({ locale }) => locale), ...translationChallenges.map(({ locale }) => locale)])
    .sort((localeA, localeB) => localeA.localeCompare(localeB));
  const items = [];
  items.push([
    'key',
    ...sortedLocales,
    'tags',
    'description',
  ]);
  items.push(..._generateItemsForSkills(translationSkills, releaseContent, sortedLocales));
  items.push(..._generateItemsForChallenges(translationChallenges, releaseContent, sortedLocales));

  const stream = new PassThrough();

  pipeline(
    Readable.from(items),
    csv.format({ headers: true }),
    stream,
    () => null,
  );
  logger.info(`About to send ${items.length} to Phrase...`);
  const csvFile = new File([await streamToPromise(stream)], 'translations.csv');
  const configuration = new phraseApi.Configuration({
    fetchApi: fetch,
    apiKey: `token ${config.phrase.apiKey}`,
  });

  try {
    const locales = await new phraseApi.LocalesApi(configuration).localesList({
      projectId: config.phrase.projectId,
    });

    const defaultLocaleId = locales.find((locale) => locale._default)?.id;
    const keyIndex = 1;
    const tagIndex = keyIndex + sortedLocales.length + 1;
    const descriptionIndex = tagIndex + 1;
    const localeMapping = Object.fromEntries(sortedLocales.map((locale, index) => [locale, index + keyIndex + 1]));
    await new phraseApi.UploadsApi(configuration).uploadCreate({
      projectId: config.phrase.projectId,
      localeId: defaultLocaleId,
      file: csvFile,
      fileFormat: 'csv',
      updateDescriptions: false,
      updateTranslations: false,
      skipUploadTags: true,
      localeMapping,
      formatOptions: {
        key_index: keyIndex,
        tag_column: tagIndex,
        comment_index: descriptionIndex,
        header_content_row: true,
      }
    });
  } catch (e) {
    const text = await e.text?.() ?? e;
    logger.error(`Phrase error while uploading translations: ${text}`);
    throw new Error('Phrase error', { cause: e });
  }
}

const baseUrl = config.lcms.baseUrl;

function _generateDescriptionForChallenge(challengeId, locales) {
  const primaryLocalePreviewUrl = `Prévisualisation FR: ${baseUrl}/api/challenges/${challengeId}/preview`;
  const alternativeLocalePreviewUrls = locales
    .filter((locale) => locale !== 'fr')
    .map((locale) => {
      return `Prévisualisation ${locale.toUpperCase()}: ${baseUrl}/api/challenges/${challengeId}/preview?locale=${locale}`;
    });
  const peURL = `Pix Editor: ${baseUrl}/challenge/${challengeId}`;

  return `${[primaryLocalePreviewUrl, ...alternativeLocalePreviewUrls, peURL].join('\n')}`;
}

function _generateItemsForSkills(translationSkills, releaseContent, sortedLocales) {
  const skillItems = [];
  const translationsSkillByKey =  _.groupBy(translationSkills, 'key');
  for (const [key, translations] of Object.entries(translationsSkillByKey)) {
    const skillItem = [];
    skillItem.push(key);
    skillItem.push(...sortedLocales.map((locale) => {
      const translationForLocale = translations.find((translation) => translation.locale === locale);
      return translationForLocale?.value ?? '';
    }));
    const skillTags = _generateTagsForSkill(key.split('.')[1], releaseContent);
    skillItem.push(skillTags);
    skillItem.push('');
    skillItems.push(skillItem);
  }
  return skillItems;
}

function _generateItemsForChallenges(translationChallenges, releaseContent, sortedLocales) {
  const challengeItems = [];
  const translationsChallengeByKey =  _.groupBy(translationChallenges, 'key');
  for (const [key, translations] of Object.entries(translationsChallengeByKey)) {
    const challengeItem = [];
    challengeItem.push(key);
    challengeItem.push(...sortedLocales.map((locale) => {
      const translationForLocale = translations.find((translation) => translation.locale === locale);
      return translationForLocale?.value ?? '';
    }));
    const challengeTags = _generateTagsForChallenge(key.split('.')[1], releaseContent);
    const challengeDescription = _generateDescriptionForChallenge(key.split('.')[1], sortedLocales);
    challengeItem.push(challengeTags);
    challengeItem.push(challengeDescription);
    challengeItems.push(challengeItem);
  }
  return challengeItems;
}

function _generateTagsForSkill(skillId, release) {
  const tags = _generateCommonTagPart(skillId, release);
  const rawTags = `acquis,${tags}`;
  return `${toTag(rawTags)}`;
}

function _generateTagsForChallenge(challengeId, release) {
  const challenge = release.challenges[challengeId];
  const tags = _generateCommonTagPart(challenge.skillId, release);
  const challengeTag = `${tags.split(',')[0]}-${challenge.status}`;
  const rawTags = `epreuve,${challengeTag},${tags}`;
  return `${toTag(rawTags)}`;
}

function _generateCommonTagPart(skillId, release) {
  const skill = release.skills[skillId];
  const tube = release.tubes[skill.tubeId];
  const competence = release.competences[tube.competenceId];
  const area = release.areas[competence.areaId];
  const framework = release.frameworks[area.frameworkId];
  const frameworkTag = `${framework.name}`;
  const areaTag = `${frameworkTag}-${area.code}`;
  const competenceTag = `${areaTag}-${competence.index}`;
  const tubeTag = `${competenceTag}-${tube.name}`;
  const skillTag = `${tubeTag}-${skill.name}`;
  return `${skillTag},${tubeTag},${competenceTag},${areaTag},${frameworkTag}`;
}

function toTag(tagName) {
  return _(tagName).deburr().replaceAll(' ', '_').replaceAll('@', '');
}

const __filename = fileURLToPath(import.meta.url);
const isLaunchedFromCommandLine = process.argv[1] === __filename;

async function main() {
  if (!isLaunchedFromCommandLine) return;

  try {
    const airtableClient = new Airtable({
      apiKey: process.env.AIRTABLE_API_KEY,
    }).base(process.env.AIRTABLE_BASE);
    const dryRun = process.env.DRY_RUN !== 'false';

    if (dryRun) logger.warn('Dry run: no actual modification will be performed, use DRY_RUN=false to disable');

    await uploadToPhrase({ airtableClient, dryRun });
    logger.info('All done');
  } catch (e) {
    logger.error(e);
    process.exitCode = 1;
  } finally {
    await disconnect();
  }
}

main();
