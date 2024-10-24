import _ from 'lodash';
import { extractParameters } from '../../infrastructure/utils/query-params-utils.js';
import { findAllMissions, createMission, updateMission } from '../../domain/usecases/index.js';
import { missionSerializer } from '../../infrastructure/serializers/jsonapi/index.js';
import * as missionRepository from '../../infrastructure/repositories/mission-repository.js';
//TODO Faire éventuellement un refacto pour mutualiser la gestion de la pagination
const DEFAULT_PAGE = {
  number: 1,
  size: 10,
  maxSize: 100,
};

export async function findMissions(request, h) {
  const { filter, page } = extractParameters(request.query);
  const { missions, meta } = await findAllMissions({ filter: normalizeFilter(filter), page: normalizePage(page) });
  return h.response(missionSerializer.serializeMissionSummary(missions, meta));
}

export async function getMission(request, h) {
  const mission = await missionRepository.getById(request.params.id);
  return h.response(missionSerializer.serializeMission(mission));
}

export async function create(request, h) {
  const attributes = request?.payload?.data?.attributes;
  const mission = missionSerializer.deserializeMission(attributes);
  const { mission: savedMission, warnings } = await createMission(mission);
  return h.response(missionSerializer.serializeMission(savedMission, warnings)).created();
}
export async function update(request, h) {
  const attributes = request?.payload?.data?.attributes;
  const missionId = request?.params?.id;
  const mission = missionSerializer.deserializeMission({ ...attributes, id: missionId });
  const { mission: updatedMission, warnings } = await updateMission(mission);
  return h.response(missionSerializer.serializeMission(updatedMission, warnings)).created();
}

function normalizePage(page) {
  return {
    number: _.isInteger(page.number) && Math.sign(page.number) === 1 ? page.number : DEFAULT_PAGE.number,
    size: _.isInteger(page.size) && Math.sign(page.size) === 1 ? Math.min(page.size, DEFAULT_PAGE.maxSize) : DEFAULT_PAGE.size,
  };
}

function normalizeFilter(filter) {
  return {
    statuses: filter.statuses,
  };
}

