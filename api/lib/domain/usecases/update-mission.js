import { missionRepository, challengeRepository } from '../../infrastructure/repositories/index.js';
import { Challenge, Mission } from '../models/index.js';
import { BadRequestError } from '../../infrastructure/errors.js';
import _ from 'lodash';
import { MissionIntroductionMediaError } from '../errors.js';

export async function updateMission(mission, dependencies = { missionRepository }) {
  await missionRepository.getById(mission.id);

  if (mission.status === Mission.status.VALIDATED && mission.thematicIds) {
    const challenges = await challengeRepository.filterByThematicIds(mission.thematicIds.split(','));
    const nonValidatedChallengeIds = challenges.filter((challenge) => challenge.status !== Challenge.STATUSES.VALIDE).map((challenge) => `"${challenge.id}"`);

    if (nonValidatedChallengeIds.length > 0) {
      throw new BadRequestError(`La mission ne peut pas être mise à jour car les challenges ${nonValidatedChallengeIds.join(', ')} ne sont pas au statut VALIDE`);
    }
  }

  if (!_.isNull(mission.introductionMediaUrl) && _.isNull(mission.introductionMediaType)) {
    throw new MissionIntroductionMediaError('Opération impossible car la mission n\'a pas de type pour le media d\'introduction.');
  }
  if (!_.isNull(mission.introductionMediaType) && _.isNull(mission.introductionMediaUrl)) {
    throw new MissionIntroductionMediaError('Opération impossible car la mission ne peut avoir de type de média sans URL pour ce dernier.');
  }
  return await dependencies.missionRepository.save(mission);
}
