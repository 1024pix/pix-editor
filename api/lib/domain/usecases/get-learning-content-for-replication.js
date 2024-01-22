import {
  areaDatasource,
  attachmentDatasource,
  thematicDatasource,
  tubeDatasource,
  tutorialDatasource,
} from '../../infrastructure/datasources/airtable/index.js';
import { challengeRepository, localizedChallengeRepository, competenceRepository, skillRepository } from '../../infrastructure/repositories/index.js';
import { knex } from '../../../db/knex-database-connection.js';
import { createChallengeTranslator } from '../services/translate-challenge.js';

export async function getLearningContentForReplication() {
  const [
    areas,
    competences,
    tubes,
    skills,
    challenges,
    localizedChallenges,
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
    localizedChallengeRepository.list(),
    tutorialDatasource.list(),
    attachmentDatasource.list(),
    thematicDatasource.list(),
    _getCoursesFromPGForReplication(),
  ]);
  const translateChallenge = createChallengeTranslator({ localizedChallenges });

  const translatedChallenges = challenges.flatMap(translateChallenge).map(normalizeChallenge);

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
  delete challenge.translations;

  return challenge;
}
