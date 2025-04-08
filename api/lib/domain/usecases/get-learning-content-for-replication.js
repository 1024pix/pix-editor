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
  ]);
  const transformedFrameworks = frameworkTransformer.filterFrameworksFields(frameworks);
  const transformedAreas = areaTransformer.filterAreasFields(areas);
  const transformedCompetences = competenceTransformer.filterCompetencesFields(competences);
  const transformedThematics = thematicTransformer.filterThematicsFields(thematics);
  const transformedTubes = tubes.map(tubeTransformer.filterTubeFields);

  fillAlternativeQualityFieldsFromMatchingProto(challenges, skills);
  const translatedChallenges = challenges
    .flatMap((challenge) => [
      challenge,
      ...challenge.alternativeLocales.map((locale) => challenge.translate(locale)),
    ])
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
  };
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
