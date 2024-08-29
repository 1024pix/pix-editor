import { missionRepository } from '../../infrastructure/repositories/index.js';
import  * as missionValidator from '../services/mission-validator.js';

export async function updateMission(mission, dependencies = { missionRepository }) {
  await missionRepository.getById(mission.id);

  const warnings = await missionValidator.validate(mission);

  const updatedMission = await dependencies.missionRepository.save(mission);

  return { mission: updatedMission, warnings };
}
