import { challengeRepository, competenceRepository, frameworkRepository, skillRepository } from '../lib/infrastructure/repositories/index.js';
import { Challenge, Skill } from '../lib/domain/models/index.js';

export async function listActiveSkillsByFrameworkName(frameworkName) {
  const frameworks = await frameworkRepository.list();
  if (!frameworks.find(({ name }) => name === frameworkName)) throw new Error('framework with this given name does not exist');

  const activeSkills = [];

  const competences = await competenceRepository._selectCompetences().where('frameworks.name', '=', frameworkName);
  for (const competence of competences) {
    const competenceActiveSkills = await skillRepository.listActiveByCompetenceId(competence.id);
    activeSkills.push(...competenceActiveSkills);
  }

  console.log(activeSkills);

  return activeSkills;
}
