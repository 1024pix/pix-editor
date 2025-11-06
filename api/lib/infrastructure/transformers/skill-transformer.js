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
export function forRelease(skills) {
  if (Array.isArray(skills)) {
    const skillsForRelease = skills.map((skill) => new SkillForRelease(skill));
    const pixValuesBySkill = computePixValuesBySkill(skills);
    skillsForRelease.forEach((skill) => (skill.pixValue = pixValuesBySkill[skill.id] ?? 0));
    return skillsForRelease;
  }
  return new SkillForRelease(skills);
}

/**
 @param {Skill|Skill[]} skills
 @returns {SkillForReplication|SkillForReplication[]}
 */
export function forReplication(skills) {
  if (Array.isArray(skills)) {
    return skills.map((skill) => new SkillForReplication(skill));
  }
  return new SkillForReplication(skills);
}
