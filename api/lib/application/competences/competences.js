import { competenceRepository, thematicRepository, tubeRepository, skillRepository, challengeRepository, tutorialRepository } from '../../infrastructure/repositories/index.js';
import { CompetenceOverview } from '../../domain/readmodels/index.js';
import { extractParameters } from '../../infrastructure/utils/query-params-utils.js';
import { competenceOverviewSerializer } from '../../infrastructure/serializers/jsonapi/index.js';

export async function getCompetenceOverview(request, h) {
  let { locale } = extractParameters(request.query);

  locale = locale ?? 'fr';
  const competence = await competenceRepository.getById(request.params.id);
  const thematicsForCompetence = await thematicRepository.getMany(competence.thematicIds);
  const tubesForCompetence = await tubeRepository.getMany(thematicsForCompetence.flatMap((thematic) => thematic.tubeIds));
  const tubeIds = tubesForCompetence.map(({ id }) => id);
  const skillsForCompetence = [];
  for (const tubeId of tubeIds) {
    const skillsByTube = await skillRepository.listByTubeId(tubeId);
    skillsForCompetence.push(...skillsByTube);
  }
  const skillIds = skillsForCompetence.map(({ id }) => id);
  const challengesForCompetence = [];
  for (const skillId of skillIds) {
    const challengesBySkill = await challengeRepository.listBySkillId(skillId);
    challengesForCompetence.push(...challengesBySkill);
  }
  const learningMoreTutoIds = skillsForCompetence.flatMap(({ learningMoreTutorialIds }) => learningMoreTutorialIds ?? []);
  const tutoIds = skillsForCompetence.flatMap(({ tutorialIds }) => tutorialIds ?? []);
  const tutorialsForCompetence = await tutorialRepository.getMany([...tutoIds, ...learningMoreTutoIds]);

  const competenceOverview = CompetenceOverview.build({ locale, competence, thematicsForCompetence, tubesForCompetence, skillsForCompetence, challengesForCompetence, tutorialsForCompetence });

  return h.response(competenceOverviewSerializer.serialize(competenceOverview));
}
