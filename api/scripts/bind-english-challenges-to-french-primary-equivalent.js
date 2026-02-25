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

export async function listLegacyEnglishChallengesBySkillId(skillId) {
  const challenges = await challengeRepository.listBySkillId(skillId);
  const decliChallenges = challenges.filter((challenge) => challenge.genealogy !== Challenge.GENEALOGIES.PROTOTYPE);
  const validatedAndProposedChallenges = decliChallenges.filter((decli) => decli.status === Challenge.STATUSES.VALIDE || decli.status === Challenge.STATUSES.PROPOSE);
  // Existe-t-il des prototypes en english, ou ne sont-ce que des déclis ?
  return validatedAndProposedChallenges.filter((decliChallenge) => decliChallenge.locale === 'en');
}
