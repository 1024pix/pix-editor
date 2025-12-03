import {
  challengeRepository,
  competenceRepository,
  localizedFrameworksTubesRepository,
  skillRepository,
  thematicRepository,
  tubeRepository,
} from '../../infrastructure/repositories/index.js';
import { CompetenceOverview } from '../readmodels/index.js';

export async function getCompetenceChallengesProductionOverview({ competenceId, locale }) {
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
    skillRepository.listActiveByCompetenceId(competenceId),
    challengeRepository.listActiveOrDraftByCompetenceId(competenceId),
  ]);
  const localizedFrameworkTubes = locale ? await localizedFrameworksTubesRepository.filter({ competenceId, locale }) : null;
  return CompetenceOverview.buildForChallengesProduction({
    competence,
    thematics,
    tubes,
    skills,
    challenges,
    locale,
    localizedFrameworkTubes,
  });
}
