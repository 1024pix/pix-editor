import * as repositories from '../../infrastructure/repositories/index.js';
export async function findAllMissions(params, missionRepository = repositories.missionRepository) {
  return await missionRepository.findAllMissions(params);
}
