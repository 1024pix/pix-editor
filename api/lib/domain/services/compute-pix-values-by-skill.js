import { Skill } from '../models/index.js';

export function computePixValuesBySkill(skills) {
  const LEVELS_PER_SKILL_COUNT = 8;
  const MAX_PIX_VALUE_PER_SKILL = 4;

  const activeSkills = skills.filter(({ status }) => status === Skill.STATUSES.ACTIF);

  const skillsByCompetence = Object.groupBy(activeSkills, ({ competenceId }) => competenceId);

  const skillsByCompetenceAndLevel = {};

  for (const [competenceId, skills] of Object.entries(skillsByCompetence)) {
    skillsByCompetenceAndLevel[competenceId] = Object.groupBy(skills, ({ level }) => level);
  }
  const pixValuesBySkill = {};

  activeSkills.forEach(({ id, competenceId, level }) => {
    pixValuesBySkill[id] = Math.min(
      MAX_PIX_VALUE_PER_SKILL,
      LEVELS_PER_SKILL_COUNT / skillsByCompetenceAndLevel[competenceId][level].length,
    );
  });
  return pixValuesBySkill;
}
