import { tutorialDatasource, } from '../../infrastructure/datasources/airtable/index.js';
import {
  areaRepository,
  attachmentRepository,
  challengeRepository,
  competenceRepository,
  skillRepository,
  thematicRepository,
  tubeRepository,
} from '../../infrastructure/repositories/index.js';
import { competenceTransformer, thematicTransformer, tubeTransformer, fillAlternativeQualityFieldsFromMatchingProto } from '../../infrastructure/transformers/index.js';
import { knex } from '../../../db/knex-database-connection.js';

export async function getLearningContentForReplication() {
  const [
    areas,
    competences,
    tubes,
    skills,
    challenges,
    tutorials,
    attachments,
    thematics,
    courses,
  ] = await Promise.all([
    areaRepository.list(),
    competenceRepository.list(),
    tubeRepository.list(),
    skillRepository.list(),
    challengeRepository.list(),
    tutorialDatasource.list(),
    attachmentRepository.list(),
    thematicRepository.list(),
    _getCoursesFromPGForReplication(),
  ]);
  fillAlternativeQualityFieldsFromMatchingProto(challenges);
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
  const transformedCompetences = competenceTransformer.filterCompetencesFields(competences);
  const transformedThematics = thematicTransformer.filterThematicsFields(thematics);
  const transformedTubes = tubes.map(tubeTransformer.filterTubeFields);

  return {
    areas,
    competences: transformedCompetences,
    tubes: transformedTubes,
    skills,
    challenges: translatedChallenges,
    tutorials,
    attachments: translatedAttachments,
    thematics: transformedThematics,
    courses
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
