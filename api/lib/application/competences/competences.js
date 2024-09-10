import { competenceRepository, thematicRepository, tubeRepository, skillRepository, challengeRepository, tutorialRepository } from '../../infrastructure/repositories/index.js';
import { CompetenceOverview } from '../../domain/readmodels/index.js';
import { extractParameters } from '../../infrastructure/utils/query-params-utils.js';
import { competenceOverviewSerializer } from '../../infrastructure/serializers/jsonapi/index.js';

export async function getCompetenceOverview(request, h) {
  let { locale } = extractParameters(request.query);
  locale = locale ?? 'fr';

  const competenceId = request.params.id;

  const [
    competence,
    thematicsForCompetence,
    tubesForCompetence,
    skillsForCompetence,
    challengesForCompetence,
  ] = await Promise.all([
    competenceRepository.getById(competenceId),
    thematicRepository.listByCompetenceId(competenceId),
    tubeRepository.listByCompetenceId(competenceId),
    skillRepository.listByCompetenceId(competenceId),
    challengeRepository.listByCompetenceId(competenceId),
  ]);

  const learningMoreTutoIds = skillsForCompetence.flatMap(({ learningMoreTutorialIds }) => learningMoreTutorialIds ?? []);
  const tutoIds = skillsForCompetence.flatMap(({ tutorialIds }) => tutorialIds ?? []);
  const tutorialsForCompetence = await tutorialRepository.getMany([...tutoIds, ...learningMoreTutoIds]);

  const competenceOverview = CompetenceOverview.build({ locale, competence, thematicsForCompetence, tubesForCompetence, skillsForCompetence, challengesForCompetence, tutorialsForCompetence });

  return h.response(competenceOverviewSerializer.serialize(competenceOverview));
}
