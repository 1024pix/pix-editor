import { knex } from '../../../db/knex-database-connection.js';
import { fetchPage } from '../utils/knex-utils.js';
import { Mission } from '../../domain/models/index.js';
import * as translationRepository from './translation-repository.js';
import _ from 'lodash';
import * as missionTranslations from '../translations/mission.js';
import { NotFoundError } from '../../domain/errors.js';

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

export async function list() {
  const missions = await knex('missions').select('*');

  const translations = await translationRepository.listByPrefix(missionTranslations.prefix);

  return _toDomainList(missions, translations);
}

export async function save(mission) {
  const [insertedMission] = await knex('missions').insert({
    id: mission.id,
    competenceId: mission.competenceId,
    thematicId: mission.thematicId,
    status: mission.status
  }).onConflict('id')
    .merge()
    .returning('*');

  const translations = missionTranslations.extractFromReleaseObject({ ...mission, id: insertedMission.id });
  await translationRepository.save({ translations, shouldDuplicateToAirtable: false });

  return _toDomain(insertedMission, translations);
}

function _toDomain(mission, translations) {
  const translationsByMissionId = _.groupBy(translations, ({ key }) => key.split('.')[1]);
  return new Mission({
    id: mission.id,
    createdAt: mission.createdAt,
    status: mission.status,
    competenceId: mission.competenceId,
    thematicId: mission.thematicId,
    ...missionTranslations.toDomain(translationsByMissionId[mission.id])
  });
}

function _toDomainList(missions, translations) {
  const translationsByMissionId = _.groupBy(translations, ({ key }) => key.split('.')[1]);
  return missions.map((mission) => _toDomain(mission, translationsByMissionId[mission.id]));
}
