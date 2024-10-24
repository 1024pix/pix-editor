import {
  thematicRepository,
  tubeRepository,
  skillRepository,
  challengeRepository,
} from '../../infrastructure/repositories/index.js';
import { CompetenceOverview } from '../readmodels/index.js';

export async function getCompetenceChallengesProductionOverview({ competenceId }) {
  const [
    thematics,
    tubes,
    skills,
    challenges,
  ] = await Promise.all([
    thematicRepository.listByCompetenceId(competenceId),
    tubeRepository.listByCompetenceId(competenceId),
    skillRepository.listActiveByCompetenceId(competenceId),
    challengeRepository.listActiveOrDraftByCompetenceId(competenceId),
  ]);
  return CompetenceOverview.buildForChallengesProduction({ competenceId, thematics, tubes, skills, challenges });
}
