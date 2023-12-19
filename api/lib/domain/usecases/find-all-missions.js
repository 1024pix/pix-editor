import * as repositories from '../../infrastructure/repositories/index.js';
import { MissionSummary } from '../readmodels/index.js';
export async function findAllMissions(params, missionRepository = repositories.missionRepository, competenceRepository = repositories.competenceRepository) {
  const result = await missionRepository.findAllMissions(params);
  const competences = await competenceRepository.list();

  const missionSummmaries = result.missions.map((mission) => {
    const missionCompetence = competences.find((competence) => competence.id === mission.competenceId);
    return new MissionSummary({
      ...mission,
      name: mission.name_i18n.fr,
      learningObjectives: mission.learningObjectives_i18n.fr,
      validatedObjectives: mission.validatedObjectives_i18n.fr,
      competence: missionCompetence ? `${missionCompetence.index} ${missionCompetence.name_i18n.fr}` : `Compétence non trouvée : ${mission.competenceId}`
    });
  });
  return { missions: missionSummmaries, meta: result.meta };
}
