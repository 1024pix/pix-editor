import {
  thematicRepository,
  tubeRepository,
  skillRepository,
  challengeRepository,
} from '../../infrastructure/repositories/index.js';
import { CompetenceOverview } from '../readmodels/index.js';

export async function getCompetenceChallengesWorkbenchOverview({ competenceId }) {
  const [
    thematics,
    tubes,
    skills,
    challenges,
  ] = await Promise.all([
    thematicRepository.listByCompetenceId(competenceId),
    tubeRepository.listByCompetenceId(competenceId),
    skillRepository.listByCompetenceId(competenceId),
    challengeRepository.listPrototypesByCompetenceId(competenceId),
  ]);
  return CompetenceOverview.buildForChallengesWorkbench({ competenceId, thematics, tubes, skills, challenges });
}
