import { missionRepository } from '../../infrastructure/repositories/index.js';
import { MissionIntroductionMediaError } from '../errors.js';
import _ from 'lodash';

export async function createMission(mission, dependencies = { missionRepository }) {
  if (!_.isNull(mission.introductionMediaUrl) && _.isNull(mission.introductionMediaType)) {
    throw new MissionIntroductionMediaError('Opération impossible car la mission n\'a pas de type pour le media d\'introduction.');
  }
  if (!_.isNull(mission.introductionMediaType) && _.isNull(mission.introductionMediaUrl)) {
    throw new MissionIntroductionMediaError('Opération impossible car la mission ne peut avoir de type de média sans URL pour ce dernier.');
  }

  return await dependencies.missionRepository.save(mission);
}
