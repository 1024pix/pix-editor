import {
  areaDatasource,
  attachmentDatasource,
  thematicDatasource,
  tubeDatasource,
  tutorialDatasource,
} from '../../infrastructure/datasources/airtable/index.js';
import { challengeRepository, competenceRepository, skillRepository } from '../../infrastructure/repositories/index.js';
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
    areaDatasource.list(),
    competenceRepository.list(),
    tubeDatasource.list(),
    skillRepository.list(),
    challengeRepository.list(),
    tutorialDatasource.list(),
    attachmentDatasource.list(),
    thematicDatasource.list(),
    _getCoursesFromPGForReplication(),
  ]);

  const translatedChallenges = challenges
    .flatMap((challenge) => [
      challenge,
      ...challenge.alternativeLocales.map((locale) => challenge.translate(locale)),
    ])
    .map(normalizeChallenge);

  return {
    areas,
    competences,
    tubes,
    skills,
    challenges: translatedChallenges,
    tutorials,
    attachments,
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

  return challenge;
}
