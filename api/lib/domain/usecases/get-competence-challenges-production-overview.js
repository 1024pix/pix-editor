import {
  thematicRepository
} from '../../infrastructure/repositories/index.js';
import { CompetenceOverview } from '../readmodels/index.js';

export async function getCompetenceChallengesProductionOverview({ competenceId }) {
  const thematics = await thematicRepository.listByCompetenceId(competenceId);
  return CompetenceOverview.buildForChallengesProduction({ competenceId, thematics });
}
