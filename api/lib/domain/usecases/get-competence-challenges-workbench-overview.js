import {
  challengeRepository,
  competenceRepository,
  skillRepository,
  thematicRepository,
  tubeRepository,
} from '../../infrastructure/repositories/index.js';
import { CompetenceOverview } from '../readmodels/index.js';

export async function getCompetenceChallengesWorkbenchOverview({ competenceId }) {
  const [
    competence,
    thematics,
    tubes,
    skills,
    challenges,
  ] = await Promise.all([
    competenceRepository.get(competenceId),
    thematicRepository.listByCompetenceId(competenceId),
    tubeRepository.listByCompetenceId(competenceId),
    skillRepository.listByCompetenceId(competenceId),
    challengeRepository.listPrototypesByCompetenceId(competenceId),
  ]);
  return CompetenceOverview.buildForChallengesWorkbench({
    competence,
    thematics,
    tubes,
    skills,
    challenges,
  });
}
