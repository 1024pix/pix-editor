import { Mission } from '../models/index.js';
import _ from 'lodash';
import { InvalidMissionContentError, MissionIntroductionMediaError } from '../errors.js';
import * as challengeRepository from '../../infrastructure/repositories/challenge-repository.js';
import * as thematicRepository from '../../infrastructure/repositories/thematic-repository.js';
import * as skillRepository from '../../infrastructure/repositories/skill-repository.js';
import * as tubeRepository from '../../infrastructure/repositories/tube-repository.js';

export async function validate(mission, dependencies = { challengeRepository }) {
  _validateMissionIntroductionMedia(mission);
  return _validateMissionContent(mission, dependencies.challengeRepository);
}

function _validateMissionIntroductionMedia(mission) {
  if (!_.isNull(mission.introductionMediaUrl) && _.isNull(mission.introductionMediaType)) {
    throw new MissionIntroductionMediaError('Opération impossible car la mission n\'a pas de type pour le media d\'introduction.');
  }

  if (!_.isNull(mission.introductionMediaType) && _.isNull(mission.introductionMediaUrl)) {
    throw new MissionIntroductionMediaError('Opération impossible car la mission ne peut avoir de type de média sans URL pour ce dernier.');
  }
}

async function _validateMissionContent(mission) {
  const warnings = [];
  if (mission.status === Mission.status.VALIDATED) {
    if (!mission.thematicIds) throw new InvalidMissionContentError('La mission ne peut pas être mise à jour car elle n\'a pas de thématique');

    const thematics = await thematicRepository.getMany(mission.thematicIds.split(','));

    const tubeIds = thematics.flatMap((thematic) => thematic.tubeIds);
    if (tubeIds.length === 0)  throw new InvalidMissionContentError('La mission ne peut pas être mise à jour car elle n\'a pas de sujet');

    for (const tubeId of tubeIds) {
      const skills = await skillRepository.listByTubeId(tubeId);
      const maxlevel = Math.max(...(skills.map((skill) => skill.level)));
      for (let level = 1; level <= maxlevel; level++) {
        const skillsByLevel = skills.filter((skill) => skill.level === level);
        const activeSkillByLevel = skillsByLevel.filter((skill) => skill.isActif);

        if (activeSkillByLevel.length === 0) {
          const tube = await tubeRepository.get(tubeId);
          if (skillsByLevel.filter((skill) => skill.isEnConstruction).length > 0) warnings.push(`L\'activité \'${tube.name}\' n\'a pas d\'acquis actif pour le niveau ${level}.`);
        }
      }
    }
  }
  return warnings;
}

