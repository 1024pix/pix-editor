import { missionRepository } from '../../infrastructure/repositories/index.js';

export async function updateMission(mission, dependencies = { missionRepository }) {
  await missionRepository.getById(mission.id);
  return await dependencies.missionRepository.save(mission);
}
