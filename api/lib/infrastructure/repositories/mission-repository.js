import { knex } from '../../../db/knex-database-connection.js';
import { fetchPage } from '../utils/knex-utils.js';
import { Challenge, Mission } from '../../domain/models/index.js';
import _ from 'lodash';
import * as missionTranslations from '../translations/mission.js';
import { NotFoundError } from '../../domain/errors.js';
import { challengeRepository, skillRepository, translationRepository, tubeRepository } from './index.js';
import { thematicDatasource } from '../datasources/airtable/index.js';
import { logger } from '../logger.js';

export async function getById(id) {
  const mission = await knex('missions').select('*').where({ id }).first();
  if (!mission) {
    throw new NotFoundError('Mission introuvable');
  }

  const translations = await translationRepository.listByPrefix(missionTranslations.prefix);
  return _toDomain(mission, translations);
}

export async function findAllMissions({ filter, page }) {
  const query = knex('missions')
    .select('*')
    .orderBy('createdAt', 'desc');
  if (filter?.isActive) {
    query.where('status', Mission.status.ACTIVE);
  }
  const { results, pagination } = await fetchPage(query, page);
  const translations = await translationRepository.listByPrefix(missionTranslations.prefix);

  return {
    missions: _toDomainList(results, translations),
    meta: pagination
  };
}

const SCHOOL_PLAYABLE_STATUSES = [Challenge.STATUSES.VALIDE, Challenge.STATUSES.PROPOSE];

export async function list() {
  const missions = await knex('missions').select('*');

  const translations = await translationRepository.listByPrefix(missionTranslations.prefix);
  const tubes = await tubeRepository.list();
  const thematics = await thematicDatasource.list();
  const skills = await skillRepository.list();

  const challenges = await challengeRepository.list();

  const missionsWithContent = missions.map((mission) => {
    const thematicIds = mission.thematicIds?.split(',') ?? [];
    const content = {
      steps: []
    };

    thematicIds.forEach((thematicId, index) => {
      const thematic = thematics.find((thematic) => thematic.id === thematicId);

      if (!thematic) {
        logger.warn({ mission }, 'No thematic found for mission');
        return;
      }

      const missionTubes = tubes.filter((tube) => thematic?.tubeIds?.includes(tube.id));
      if (missionTubes.length === 0) {
        logger.warn({ mission }, 'No tubes found for mission');
        return;
      }

      if (index < thematicIds.length - 1) {
        content.steps.push({
          tutorialChallenges: _getChallengeIdsForActivity(missionTubes, skills, challenges, '_di'),
          trainingChallenges: _getChallengeIdsForActivity(missionTubes, skills, challenges, '_en'),
          validationChallenges: _getChallengeIdsForActivity(missionTubes, skills, challenges, '_va'),
        });
      } else {
        content.dareChallenges = _getChallengeIdsForActivity(missionTubes, skills, challenges, '_de');
      }
    });
    return new Mission({ ...mission, content });
  });

  return _toDomainList(missionsWithContent, translations);
}

const _byLevel = (skillA, skillB) => skillA.level - skillB.level;

function _getChallengeIdsForActivity(missionTubes, skills, challenges, activityPostfix) {
  const activityTube = missionTubes.find(({ name }) => name.endsWith(activityPostfix));

  if (!activityTube) {
    logger.warn({ missionTubes }, `No tubes found for postFix ${activityPostfix} in mission tubes`);
    return [];
  }

  const activitySkills = skills.filter((skill) => skill.tubeId === activityTube.id).sort(_byLevel);

  if (!activitySkills) {
    logger.warn({ activityTube }, 'No skills found for activityTube');
    return [];
  }

  return activitySkills.map((activitySkill) => {
    const alternatives = challenges
      .filter((challenge) => activitySkill.id === challenge.skillId)
      .filter((challenge) => SCHOOL_PLAYABLE_STATUSES.includes(challenge.status.toLowerCase()));

    if (alternatives.length === 0) {
      logger.warn({ activitySkill }, 'No challenges found for activitySkill');
    }
    return alternatives.map(({ id }) => id);
  }).filter((activitySkills) => activitySkills.length > 0);
}

export async function save(mission) {
  const [insertedMission] = await knex('missions').insert({
    id: mission.id,
    competenceId: mission.competenceId,
    thematicIds: mission.thematicIds,
    status: mission.status
  }).onConflict('id')
    .merge()
    .returning('*');

  const translations = missionTranslations.extractFromReleaseObject({ ...mission, id: insertedMission.id });
  await translationRepository.save({ translations, shouldDuplicateToAirtable: false });

  return _toDomain(insertedMission, translations);
}

function _toDomain(mission, translations) {
  const translationsByMissionId = _.groupBy(translations, 'entityId');
  return new Mission({
    id: mission.id,
    createdAt: mission.createdAt,
    status: mission.status,
    competenceId: mission.competenceId,
    thematicIds: mission.thematicIds,
    content: mission.content,
    ...missionTranslations.toDomain(translationsByMissionId[mission.id])
  });
}

function _toDomainList(missions, translations) {
  const translationsByMissionId = _.groupBy(translations, 'entityId');
  return missions.map((mission) => _toDomain(mission, translationsByMissionId[mission.id]));
}
