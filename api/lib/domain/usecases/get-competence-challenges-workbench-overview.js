import {
  challengeRepository,
  competenceRepository,
  skillRepository,
  thematicRepository,
  tubeRepository,
  translationsConfigRepository,
} from '../../infrastructure/repositories/index.js';
import { CompetenceOverview } from '../readmodels/index.js';

export async function getCompetenceChallengesWorkbenchOverview({ competenceId }) {
  const [
    competence,
    thematics,
    tubes,
    skills,
    challenges,
    translationsConfig,
  ] = await Promise.all([
    competenceRepository.get(competenceId),
    thematicRepository.listByCompetenceId(competenceId),
    tubeRepository.listByCompetenceId(competenceId),
    skillRepository.listByCompetenceId(competenceId),
    challengeRepository.listPrototypesByCompetenceId(competenceId),
    translationsConfigRepository.getByCompetenceId(competenceId),
  ]);
  return CompetenceOverview.buildForChallengesWorkbench({
    competence,
    thematics,
    tubes,
    skills,
    challenges,
    primaryLocales: translationsConfig?.uploadedLocales || ['fr'],
  });
}
