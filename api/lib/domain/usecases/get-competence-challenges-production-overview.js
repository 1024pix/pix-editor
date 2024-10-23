import {
  thematicRepository,
  tubeRepository,
} from '../../infrastructure/repositories/index.js';
import { CompetenceOverview } from '../readmodels/index.js';

export async function getCompetenceChallengesProductionOverview({ competenceId }) {
  const [
    thematics,
    tubes,
  ] = await Promise.all([
    thematicRepository.listByCompetenceId(competenceId),
    tubeRepository.listByCompetenceId(competenceId),
  ]);
  return CompetenceOverview.buildForChallengesProduction({ competenceId, thematics, tubes });
}
