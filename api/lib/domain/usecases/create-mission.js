import { missionRepository } from '../../infrastructure/repositories/index.js';

export async function createMission(mission, dependencies = { missionRepository }) {
  return await dependencies.missionRepository.save(mission);
}
