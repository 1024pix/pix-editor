import { SkillForRelease } from '../../domain/models/release/index.js';
import { SkillForReplication } from '../../domain/models/replication/index.js';
import { computePixValuesBySkill } from '../../domain/services/compute-pix-values-by-skill.js';

/**
 * @typedef {import('../../../lib/domain/models').Skill} Skill
 * @typedef {import('../../../lib/domain/models/release').SkillForRelease} SkillForRelease
 * @typedef {import('../../../lib/domain/models/replication').SkillForReplication} SkillForReplication
 */

/**
 * @param {Skill|Skill[]} skills
 * @returns {SkillForRelease|SkillForRelease[]}
 */
export function forRelease(skills, pixFrameworkCompetenceIds) {
  if (Array.isArray(skills)) {
    const pixValuesBySkill = computePixValuesBySkill(
      skills.filter(({ competenceId }) => pixFrameworkCompetenceIds.includes(competenceId)),
    );
    return skills.map((skill) => new SkillForRelease({ ...skill, pixValue: pixValuesBySkill[skill.id] ?? 0 }));
  }
  return new SkillForRelease(skills);
}

/**
 @param {Skill|Skill[]} skills
 @returns {SkillForReplication|SkillForReplication[]}
 */
export function forReplication(skills, pixFrameworkCompetenceIds) {
  if (Array.isArray(skills)) {
    const pixValuesBySkill = computePixValuesBySkill(
      skills.filter(({ competenceId }) => pixFrameworkCompetenceIds.includes(competenceId)),
    );
    return skills.map((skill) => new SkillForReplication({ ...skill, pixValue: pixValuesBySkill[skill.id] ?? 0 }));
  }
  return new SkillForReplication(skills);
}
