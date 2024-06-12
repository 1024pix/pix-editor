import { fileURLToPath } from 'node:url';
import Airtable from 'airtable';
import { disconnect } from '../../db/knex-database-connection.js';
import { logger } from '../../lib/infrastructure/logger.js';
import {
  attachmentRepository,
  challengeRepository,
  releaseRepository,
  skillRepository,
  translationRepository
} from '../../lib/infrastructure/repositories/index.js';
import { generateNewId } from '../../lib/infrastructure/utils/id-generator.js';
import { Challenge, Skill } from '../../lib/domain/models/index.js';
import _ from 'lodash';
import * as config from '../../lib/config.js';
import { Configuration, LocalesApi, UploadsApi } from 'phrase-js';
import { streamToPromise } from '../../lib/infrastructure/utils/stream-to-promise.js';
import csv from 'fast-csv';
import { PassThrough, pipeline, Readable } from 'node:stream';

const __filename = fileURLToPath(import.meta.url);
const isLaunchedFromCommandLine = process.argv[1] === __filename;

export async function moveToFocus({ airtableClient, dryRun, skipUpload = false }) {
  const skillsToFocus = await _getSkillsToFocus({ airtableClient });
  const enConstructionSkills = skillsToFocus.filter((skill) => skill.isEnConstruction);
  const actifSkills = skillsToFocus.filter((skill) => skill.isActif);

  await _moveEnConstructionSkillsToFocus({ enConstructionSkills, dryRun });
  const { skills, challenges } = await _moveActifSkillsToFocus({ actifSkills, dryRun });
  logger.info('Uploading translations to Phrase...');
  if (!dryRun && (skills.length > 0 || challenges.length > 0) && !skipUpload) {
    logger.info('Creating a release to help us upload to Phrase...');
    const releaseId = await releaseRepository.create();
    const release = await  releaseRepository.getRelease(releaseId);
    await uploadToPhrase({ skills, challenges, release });
  }
  logger.info('Done');
}

async function _getSkillsToFocus({ airtableClient }) {
  const airtableSkills = await airtableClient
    .table('Acquis')
    .select({
      fields: [
        'id persistant',
      ],
      filterByFormula: '"en_devenir" = {Spoil_focus}',
    })
    .all();
  const skillIdsToFocus = airtableSkills.map((at) => at.get('id persistant'));
  const allSkills = await skillRepository.list();
  return allSkills.filter((skill) => skillIdsToFocus.includes(skill.id));
}

async function _moveEnConstructionSkillsToFocus({ enConstructionSkills, dryRun }) {
  logger.info(`${enConstructionSkills.length} enConstruction skills to move to focus...`);
  const challengesToPersist = [];
  for (const skill of enConstructionSkills) {
    const challenges = await challengeRepository.listBySkillId(skill.id);
    const proposeChallenges = challenges.filter((challenge) => challenge.isPropose);
    for (const challenge of proposeChallenges) {
      challenge.focusable = true;
      challengesToPersist.push(challenge);
    }
  }
  logger.info(`${challengesToPersist.length} challenges to move to focus from enConstruction skills...`);
  if (!dryRun) {
    for (const challenge of challengesToPersist) {
      await challengeRepository.update(challenge);
    }
  }
  logger.info('Done');
}

async function _moveActifSkillsToFocus({ actifSkills, dryRun }) {
  logger.info(`${actifSkills.length} actif skills to move to focus...`);

  const skills = [];
  const challenges = [];

  for (const skill of actifSkills) {
    const skillChallenges = await challengeRepository.listBySkillId(skill.id);
    const { clonedSkill, clonedChallenges } = await _cloneSkillAndChallengesAndAttachments({ skill, skillChallenges, dryRun });
    skills.push(clonedSkill);
    challenges.push(...clonedChallenges);
    await _archiveOldSkill({ skill, skillChallenges, dryRun });
  }
  return { skills, challenges };
}

async function _cloneSkillAndChallengesAndAttachments({ skill, skillChallenges, dryRun }) {
  const tubeSkills = await skillRepository.listByTubeId(skill.tubeId);
  const challengeIds = skillChallenges.map((ch) => ch.id);
  const attachments = await attachmentRepository.listByChallengeIds(challengeIds);
  // Exploitation du duck typing pour tricher
  // tubeDestination : besoin de name, competenceId et id
  const tubeDestination = {
    name: skill.name.substring(0, skill.name.length - 1),
    competenceId: skill.competenceId,
    id: skill.tubeId,
  };

  // Pré-filtrage des épreuves pour ne conserver que les proto validées et les déclinaisons validées/proposées
  const preFilteredSkillChallenges = skillChallenges.filter((challenge) =>
    (challenge.genealogy === 'Prototype 1' && challenge.isValide)
    || (challenge.genealogy === 'Décliné 1' && (challenge.isValide || challenge.isPropose))
  );

  // Ne me jugez pas, je profite de la fiesta javascript pour "cacher" des données et les récupérer plus tard pour ne pas avoir
  // à altérer la fonction de clonage et pour pouvoir l'utiliser pleinement
  // Quand on clone une épreuve elle passe automatiquement en proposé.
  // Dans notre cas on doit conserver son statut d'avant clonage (validé ou proposé)
  for (const challenge of preFilteredSkillChallenges) {
    challenge.accessibility1 = [challenge.accessibility1, challenge.status];
    for (const localizedChallenge of challenge.localizedChallenges) {
      localizedChallenge.geography = [localizedChallenge.geography, localizedChallenge.status];
    }
  }

  const { clonedSkill, clonedChallenges, clonedAttachments } = skill.cloneSkillAndChallenges({
    tubeDestination,
    level: skill.level,
    skillChallenges: preFilteredSkillChallenges,
    tubeSkills,
    attachments,
    generateNewIdFnc: generateNewId,
  });

  clonedSkill.status = Skill.STATUSES.ACTIF;

  // On passe l'épreuve en focus et, ni vu ni connu, je dépile ma donnée cachée
  // on dit merci JS
  for (const clonedChallenge of clonedChallenges) {
    clonedChallenge.focusable = true;
    clonedChallenge.status = clonedChallenge.accessibility1[1];
    clonedChallenge.accessibility1 = clonedChallenge.accessibility1[0];
    for (const clonedLocalizedChallenge of clonedChallenge.localizedChallenges) {
      clonedLocalizedChallenge.status = clonedLocalizedChallenge.geography[1];
      clonedLocalizedChallenge.geography = clonedLocalizedChallenge.geography[0];
    }
  }

  // et on répare la donnée cachée car je vais persister les épreuves ensuite
  for (const challenge of preFilteredSkillChallenges) {
    challenge.accessibility1 = challenge.accessibility1[0];
    for (const localizedChallenge of challenge.localizedChallenges) {
      localizedChallenge.geography = localizedChallenge.geography[0];
    }
  }

  if (!dryRun) {
    await skillRepository.create(clonedSkill);
    await challengeRepository.createBatch(clonedChallenges);
    await attachmentRepository.createBatch(clonedAttachments);
  }
  logger.info(`Skill ${skill.id} moved to focus along with ${clonedChallenges.length} challenges and ${clonedAttachments.length} attachments !`);
  return { clonedSkill, clonedChallenges };
}

async function _archiveOldSkill({ skill, skillChallenges, dryRun }) {
  skill.archiveSkillAndChallenges({ skillChallenges });
  if (!dryRun) {
    await skillRepository.update(skill);
    await challengeRepository.updateBatch(skillChallenges);
  }
  logger.info(`Skill ${skill.id} archived along with its ${skillChallenges.length} challenges !`);
}

export async function uploadToPhrase({ skills, challenges, release }) {
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

async function main() {
  if (!isLaunchedFromCommandLine) return;

  try {
    const airtableClient = new Airtable({
      apiKey: process.env.AIRTABLE_API_KEY,
    }).base(process.env.AIRTABLE_BASE);
    const dryRun = process.env.DRY_RUN !== 'false';

    if (dryRun) logger.warn('Dry run: no actual modification will be performed, use DRY_RUN=false to disable');

    await moveToFocus({ airtableClient, dryRun });
    logger.info('All done');
  } catch (e) {
    logger.error(e);
    process.exitCode = 1;
  } finally {
    await disconnect();
  }
}

main();

