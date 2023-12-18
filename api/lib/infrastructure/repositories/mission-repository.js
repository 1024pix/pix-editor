import { knex } from '../../../db/knex-database-connection.js';
import { fetchPage } from '../utils/knex-utils.js';
import { Mission } from '../../domain/models/Mission.js';
import * as translationRepository from './translation-repository.js';
import _ from 'lodash';
import * as missionTranslations from '../translations/mission.js';

function toDomain(mission, translations) {
  return new Mission({
    id: mission.id,
    createdAt: mission.createdAt,
    status: mission.status,
    competenceId: mission.competenceId,
    ...missionTranslations.toDomain(translations)
  });
}

export async function findAllMissions({ filter, page }) {
  const query = knex('missions')
    .select('*')
    .orderBy('createdAt', 'desc');
  if (filter.isActive) {
    query.where('status', Mission.status.ACTIVE);
  }
  const { results, pagination } = await fetchPage(query, page);

  const translations = await translationRepository.listByPrefix(missionTranslations.prefix);
  const translationsByMissionId = _.groupBy(translations, ({ key }) => key.split('.')[1]);

  const missions = results.map((mission) => toDomain(mission, translationsByMissionId[mission.id]));
  return { missions, meta: pagination };
}
