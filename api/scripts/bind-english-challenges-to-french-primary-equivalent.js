import {
  challengeRepository,
  competenceRepository,
  frameworkRepository,
  skillRepository,
} from '../lib/infrastructure/repositories/index.js';
import { Challenge } from '../lib/domain/models/index.js';

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
  return validatedAndProposedChallenges.filter((decliChallenge) => decliChallenge.locale === 'en');
}

export async function listActiveFrenchChallengesBySkillId(skillId) {
  const challenges = await challengeRepository.listBySkillId(skillId);
  const validatedChallenges = challenges.filter((challenge) => challenge.status === Challenge.STATUSES.VALIDE);
  return validatedChallenges.filter((challenge) => challenge.locale === 'fr');
}

export function assertEachLegacyEnglishChallengeHasActiveFrenchChallenge(legacyEnglishChallenges, frenchChallenges) {
  const skillId = legacyEnglishChallenges[0]?.skillId ?? frenchChallenges?.[0]?.skillId;

  const validatedChallenges = frenchChallenges.filter((challenge) => challenge.status === Challenge.STATUSES.VALIDE);
  if (legacyEnglishChallenges.length > validatedChallenges.length) {
    throw new Error(`Not enough active french challenges (${validatedChallenges.length}) for each english challenge (${legacyEnglishChallenges.length}) in skill ${skillId}`);
  }

  const notEnglishChallenges = validatedChallenges.filter((challenge) => {
    const locales = challenge.localizedChallenges.map((localized) => localized.locale);
    return !locales.includes('en');
  });
  if (legacyEnglishChallenges.length > notEnglishChallenges.length) {
    throw new Error(`Not enough active french challenges without english localized (${notEnglishChallenges.length}) for each english challenge (${legacyEnglishChallenges.length}) in skill ${skillId}`);
  };
}
