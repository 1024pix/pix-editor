import { knex } from '../../../db/knex-database-connection.js';
import { fetchPage } from '../utils/knex-utils.js';
import { Mission } from '../../domain/models/index.js';
import * as translationRepository from './translation-repository.js';
import _ from 'lodash';
import * as missionTranslations from '../translations/mission.js';

export async function findAllMissions({ filter, page }) {
  const query = knex('missions')
    .select('*')
    .orderBy('createdAt', 'desc');
  if (filter.isActive) {
    query.where('status', Mission.status.ACTIVE);
  }
  const { results, pagination } = await fetchPage(query, page);
  const translations = await translationRepository.listByPrefix(missionTranslations.prefix);

  return {
    missions: _toDomainList(results, translations),
    meta: pagination
  };
}

export async function save(mission) {
  const [insertedMission] = await knex('missions').insert({
    competenceId: mission.competenceId,
    thematicId: mission.thematicId,
    status: mission.status
  }).returning('*');

  const translations = missionTranslations.extractFromReleaseObject({ ...mission, id: insertedMission.id });
  await translationRepository.save({ translations, shouldDuplicateToAirtable: false });

  return _toDomain(insertedMission, translations);
}

function _toDomain(mission, translations) {
  return new Mission({
    id: mission.id,
    createdAt: mission.createdAt,
    status: mission.status,
    competenceId: mission.competenceId,
    thematicId: mission.thematicId,
    ...missionTranslations.toDomain(translations)
  });
}

function _toDomainList(missions, translations) {
  const translationsByMissionId = _.groupBy(translations, ({ key }) => key.split('.')[1]);
  return missions.map((mission) => _toDomain(mission, translationsByMissionId[mission.id]));
}
