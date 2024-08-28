import { missionRepository } from '../../infrastructure/repositories/index.js';
import * as missionValidator from '../services/mission-validator.js';

export async function createMission(mission, dependencies = { missionRepository }) {
  const warnings = await missionValidator.validate(mission);
  const createdMission = await dependencies.missionRepository.save(mission);
  return { mission: createdMission, warnings };
}
