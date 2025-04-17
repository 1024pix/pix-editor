import { tutorialDatasource } from '../../infrastructure/datasources/airtable/index.js';
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

export async function getLearningContentForReplication() {
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

  const translationsGroupedByEntityId = Object.groupBy(translationsForReplication, (translation) => translation.entityId);
  fillAlternativeQualityFieldsFromMatchingProto(challenges, skills);
  const translatedChallenges = challenges
    .flatMap((challenge) => {
      const translatedChallenges = challenge.alternativeLocales.map((locale) => {
        const translationsForChallenge = translationsGroupedByEntityId[challenge.id].filter((translation) => translation.locale === locale);
        const localizedChallenge = challenge.translate(locale);
        for (const translationForChallenge of translationsForChallenge) {
          const translatedField = translationForChallenge.key.split('.')[2];
          translationForChallenge.key = `${prefixFor(localizedChallenge)}${translatedField}`;
          translationForChallenge.entityId = localizedChallenge.id;
          translationForChallenge.sourceEntityId = challenge.id;
        }
        return localizedChallenge;
      });
      return [
        challenge,
        ...translatedChallenges,
      ];
    })
    .map(normalizeChallenge);

  const translatedAttachments = attachments.map((attachment) => ({
    ...attachment,
    challengeId: attachment.localizedChallengeId,
    alt: translatedChallenges.find(({ id }) => id === attachment.localizedChallengeId).illustrationAlt
  }));

  const transformedMissions = missionTransformer.transform({ missions, challenges, tubes, thematics, skills });

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
    translations: translationsForReplication.sort(byKeyAndLocale),
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
