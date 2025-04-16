import { tutorialDatasource } from '../../infrastructure/datasources/airtable/index.js';
import _ from 'lodash';
import {
  areaRepository,
  attachmentRepository,
  challengeRepository,
  competenceRepository,
  frameworkRepository,
  missionRepository,
  skillRepository,
  thematicRepository,
  translationRepository,
  tubeRepository,
} from '../../infrastructure/repositories/index.js';
import {
  areaTransformer,
  competenceTransformer,
  fillAlternativeQualityFieldsFromMatchingProto,
  frameworkTransformer,
  missionTransformer,
  thematicTransformer,
  tubeTransformer,
} from '../../infrastructure/transformers/index.js';
import { knex } from '../../../db/knex-database-connection.js';
import { prefixFor } from '../../infrastructure/translations/challenge.js';
import { logger } from '../../infrastructure/logger.js';

function prefixWithDate(str) {
  return `${new Date().toISOString()} -- ${str}`;
}
export async function getLearningContentForReplication() {
  logger.info(
    { event: 'lcms:debug-epipe' },prefixWithDate('Before promise all'));
  const [
    frameworks,
    areas,
    competences,
    thematics,
    tubes,
    skills,
    challenges,
    attachments,
    tutorials,
    courses,
    missions,
    translations,
  ] = await Promise.all([
    frameworkRepository.list(),
    areaRepository.list(),
    competenceRepository.list(),
    thematicRepository.list(),
    tubeRepository.list(),
    skillRepository.list(),
    challengeRepository.list(),
    attachmentRepository.list(),
    tutorialDatasource.list(),
    _getCoursesFromPGForReplication(),
    missionRepository.list(),
    translationRepository.list(),
  ]);
  logger.info(
    { event: 'lcms:debug-epipe' },prefixWithDate('After promise all'));
  const translationsForReplication = translations.map((translation, index) => ({
    ...translation,
    id: index + 1,
    model: translation.model,
    entityId: translation.entityId,
    sourceEntityId: null,
  }));
  const transformedFrameworks = frameworkTransformer.filterFrameworksFields(frameworks);
  const transformedAreas = areaTransformer.filterAreasFields(areas);
  const transformedCompetences = competenceTransformer.filterCompetencesFields(competences);
  const transformedThematics = thematicTransformer.filterThematicsFields(thematics);
  const transformedTubes = tubes.map(tubeTransformer.filterTubeFields);
  logger.info(
    { event: 'lcms:debug-epipe' },prefixWithDate('Some transforms'));

  const translationsByEntityId = _.groupBy(translationsForReplication, 'entityId');
  fillAlternativeQualityFieldsFromMatchingProto(challenges, skills);
  const translatedChallenges = challenges
    .flatMap((challenge) => [
      challenge,
      ...challenge.alternativeLocales.map((locale) => {
        const translationsForChallenge = translationsByEntityId[challenge.id].filter((translation) => translation.locale === locale);
        const localizedChallenge = challenge.translate(locale);
        for (const translationForChallenge of translationsForChallenge) {
          const translatedField = translationForChallenge.key.split('.')[2];
          translationForChallenge.key = `${prefixFor(localizedChallenge)}${translatedField}`;
          translationForChallenge.entityId = localizedChallenge.id;
          translationForChallenge.sourceEntityId = challenge.id;
          translationForChallenge.id = translationForChallenge.key;
        }
        return localizedChallenge;
      }),
    ])
    .map(normalizeChallenge);

  const translatedAttachments = attachments.map((attachment) => ({
    ...attachment,
    challengeId: attachment.localizedChallengeId,
    alt: translatedChallenges.find(({ id }) => id === attachment.localizedChallengeId).illustrationAlt
  }));

  const transformedMissions = missionTransformer.transform({ missions, challenges, tubes, thematics, skills });
  logger.info(
    { event: 'lcms:debug-epipe' },prefixWithDate('Some other transforms'));
  const tr = translationsForReplication.sort(byKeyAndLocale);
  logger.info(
    { event: 'lcms:debug-epipe' },prefixWithDate('Sorting translations'));

  return {
    frameworks: transformedFrameworks,
    areas: transformedAreas,
    competences: transformedCompetences,
    thematics: transformedThematics,
    tubes: transformedTubes,
    skills,
    challenges: translatedChallenges,
    attachments: translatedAttachments,
    tutorials,
    courses,
    missions: transformedMissions,
    translations: tr,
  };
}

function byKeyAndLocale(trA, trB) {
  const compareKey = trA.key.localeCompare(trB.key);
  if (compareKey === 0) {
    return trA.locale.localeCompare(trB.locale);
  }
  return compareKey;
}

async function _getCoursesFromPGForReplication() {
  return knex('static_courses')
    .select(['id', 'name'])
    .orderBy('id');
}

function normalizeChallenge(challenge) {
  delete challenge.localizedChallenges;
  challenge.area = challenge.geography;
  return challenge;
}
