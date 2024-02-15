import {
  thematicDatasource,
  tubeDatasource,
  tutorialDatasource,
} from '../../infrastructure/datasources/airtable/index.js';
import {
  areaRepository,
  attachmentRepository,
  challengeRepository,
  competenceRepository,
  skillRepository,
} from '../../infrastructure/repositories/index.js';
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
    tubeDatasource.list(),
    skillRepository.list(),
    challengeRepository.list(),
    tutorialDatasource.list(),
    attachmentRepository.list(),
    thematicDatasource.list(),
    _getCoursesFromPGForReplication(),
  ]);

  const translatedChallenges = challenges
    .flatMap((challenge) => [
      challenge,
      ...challenge.alternativeLocales.map((locale) => challenge.translate(locale)),
    ])
    .map(normalizeChallenge);

  const translatedAttachments = attachments.map((attachment) => ({
    ...attachment,
    challengeId: attachment.localizedChallengeId,
  }));

  return {
    areas,
    competences,
    tubes,
    skills,
    challenges: translatedChallenges,
    tutorials,
    attachments: translatedAttachments,
    thematics,
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
