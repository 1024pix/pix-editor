import {
  thematicRepository,
  tubeRepository,
  skillRepository,
} from '../../infrastructure/repositories/index.js';
import { CompetenceOverview } from '../readmodels/index.js';

export async function getCompetenceChallengesProductionOverview({ competenceId }) {
  const [
    thematics,
    tubes,
    skills,
  ] = await Promise.all([
    thematicRepository.listByCompetenceId(competenceId),
    tubeRepository.listByCompetenceId(competenceId),
    skillRepository.listActiveByCompetenceId(competenceId),
  ]);
  return CompetenceOverview.buildForChallengesProduction({ competenceId, thematics, tubes, skills });
}
