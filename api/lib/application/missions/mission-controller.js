import _ from 'lodash';
import { extractParameters } from '../../infrastructure/utils/query-params-utils.js';
import { findAllMissions, createMission, updateMission } from '../../domain/usecases/index.js';
import { missionSerializer } from '../../infrastructure/serializers/jsonapi/index.js';

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

export async function create(request, h) {
  const attributes = request?.payload?.data?.attributes;
  const mission = missionSerializer.deserializeMission(attributes);
  const savedMission = await createMission(mission);
  return h.response(missionSerializer.serializeMissionId(savedMission.id)).created();
}
export async function update(request, h) {
  const attributes = request?.payload?.data?.attributes;
  const missionId = request?.params?.id;
  const mission = missionSerializer.deserializeMission({ ...attributes, id: missionId });
  const updatedMission = await updateMission(mission);
  return h.response(missionSerializer.serializeMissionId(updatedMission.id)).created();
}

function normalizePage(page) {
  return {
    number: _.isInteger(page.number) && Math.sign(page.number) === 1 ? page.number : DEFAULT_PAGE.number,
    size: _.isInteger(page.size) && Math.sign(page.size) === 1 ? Math.min(page.size, DEFAULT_PAGE.maxSize) : DEFAULT_PAGE.size,
  };
}

function normalizeFilter(filter) {
  return {
    isActive: filter.isActive === 'true',
  };
}
