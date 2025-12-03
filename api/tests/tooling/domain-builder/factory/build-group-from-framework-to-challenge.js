import { buildFramework, buildArea, buildCompetence, buildThematic, buildTube, buildSkill, buildChallenge } from './index.js';

export function buildGroup(buildCommande) {
  if (buildCommande.type === 'challenge') {
    return buildChalengesType(buildCommande.challenges);
  }

  if (buildCommande.type === 'skill') {
    const skillsDTO = buildCommande.skills.map((skillDTO) => {
      return {
        ...skillDTO,
        challengeIds: skillDTO.challenges.map(({ id }) => id),
      };
    });
    const challengesDTO = buildCommande.skills.flatMap(({ challenges }) => challenges);
    console.log('challengesDTO', challengesDTO);
    return buildSkillsType(skillsDTO, challengesDTO);
  }
}

function buildChalengesType(challengesDTO) {
  const challenges = challengesDTO.map(buildChallenge);
  const skills = [buildSkill({ id: 'skillId1', challengeIds: challenges.map(({ id }) => id) })];
  const tubes = [buildTube({ id: 'tubeId1', skillIds: skills.map(({ id }) => id) })];
  const thematics = [buildThematic({ id: 'thematicId1', tubeIds: tubes.map(({ id }) => id) })];
  const competences = [
    buildCompetence({
      id: 'competenceId1',
      areaId: 'areaId1',
      skillIds: skills.map(({ id }) => id),
      tubeIds: tubes.map(({ id }) => id),
      thematicIds: thematics.map(({ id }) => id),
    },
    ),
  ];
  const areas = [buildArea({ id: 'areaId1', competenceIds: competences.map(({ id }) => id), frameworkId: 'frameworkId1' })];
  const frameworks = [buildFramework({ id: 'frameworkId1', name: 'Pix', areaIds: areas.map(({ id }) => id) })];
  return [
    frameworks,
    areas,
    competences,
    thematics,
    tubes,
    skills,
    challenges,
  ];
}

function buildSkillsType(skillsDTO, challengesDTO) {
  const challenges = challengesDTO.map(buildChallenge);
  const skills = skillsDTO.map(buildSkill);
  const tubes = [buildTube({ id: 'tubeId1', skillIds: skills.map(({ id }) => id) })];
  const thematics = [buildThematic({ id: 'thematicId1', tubeIds: tubes.map(({ id }) => id) })];
  const competences = [
    buildCompetence({
      id: 'competenceId1',
      areaId: 'areaId1',
      skillIds: skills.map(({ id }) => id),
      tubeIds: tubes.map(({ id }) => id),
      thematicIds: thematics.map(({ id }) => id),
    },
    ),
  ];
  const areas = [buildArea({ id: 'areaId1', competenceIds: competences.map(({ id }) => id), frameworkId: 'frameworkId1' })];
  const frameworks = [buildFramework({ id: 'frameworkId1', name: 'Pix', areaIds: areas.map(({ id }) => id) })];
  return [
    frameworks,
    areas,
    competences,
    thematics,
    tubes,
    skills,
    challenges,
  ];
}
