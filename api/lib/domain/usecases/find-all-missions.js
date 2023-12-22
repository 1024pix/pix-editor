import { missionRepository, competenceRepository } from '../../infrastructure/repositories/index.js';
import { MissionSummary } from '../readmodels/index.js';
export async function findAllMissions(params, dependencies = {
  missionRepository,
  competenceRepository
}) {
  const result = await dependencies.missionRepository.findAllMissions(params);
  const competences = await dependencies.competenceRepository.getMany(result.missions.map((mission) => mission.competenceId));

  const missionSummmaries = result.missions.map((mission) => {
    const missionCompetence = competences.find((competence) => competence.id === mission.competenceId);
    return new MissionSummary({
      ...mission,
      name: mission.name_i18n.fr,
      competence: missionCompetence ? `${missionCompetence.index} ${missionCompetence.name_i18n.fr}` : `Compétence non trouvée : ${mission.competenceId}`
    });
  });
  return { missions: missionSummmaries, meta: result.meta };
}
