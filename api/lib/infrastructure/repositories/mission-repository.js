import _ from 'lodash';
import { knex } from '../../../db/knex-database-connection.js';
import { fetchPage } from '../utils/knex-utils.js';
import { Mission } from '../../domain/models/index.js';
import * as missionTranslations from '../translations/mission.js';
import { NotFoundError } from '../../domain/errors.js';
import { translationRepository } from './index.js';

const model = 'mission';

export async function getById(id) {
  const [mission, translations] = await Promise.all([
    knex('missions').select('*').where({ id }).first(),
    translationRepository.listByEntity(model, id),
  ]);

  if (!mission) {
    throw new NotFoundError('Mission introuvable');
  }

  return _toDomain(mission, translations);
}

export async function findAllMissions({ filter, page }) {
  const query = knex('missions')
    .select('*')
    .orderBy('createdAt', 'desc');
  if (filter?.statuses) {
    query.whereIn('status', filter.statuses.map((status) => status.toUpperCase()));
  }
  const { results, pagination } = await fetchPage(query, page);
  const translations = await translationRepository.listByEntities(model, results.map(({ id }) => id));

  return {
    missions: _toDomainList(results, translations),
    meta: pagination
  };
}

export async function listActive() {
  const [missions, translations] = await Promise.all([
    knex('missions').select('*').whereNot({ status: 'INACTIVE' }),
    translationRepository.listByModel(model),
  ]);

  return _toDomainList(missions, translations);
}

export async function save(mission) {
  const [insertedMission] = await knex('missions').insert({
    id: mission.id,
    cardImageUrl: mission.cardImageUrl,
    competenceId: mission.competenceId,
    thematicIds: mission.thematicIds,
    status: mission.status,
    introductionMediaUrl: mission.introductionMediaUrl,
    introductionMediaType: mission.introductionMediaType,
    documentationUrl: mission.documentationUrl,
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
    cardImageUrl: mission.cardImageUrl,
    createdAt: mission.createdAt,
    status: mission.status,
    competenceId: mission.competenceId,
    thematicIds: mission.thematicIds,
    introductionMediaUrl: mission.introductionMediaUrl,
    introductionMediaType: mission.introductionMediaType,
    documentationUrl: mission.documentationUrl,
    ...missionTranslations.toDomain(translationsByMissionId[mission.id])
  });
}

function _toDomainList(missions, translations) {
  const translationsByMissionId = _.groupBy(translations, 'entityId');
  return missions.map((mission) => _toDomain(mission, translationsByMissionId[mission.id]));
}
