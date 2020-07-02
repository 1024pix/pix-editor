import { helper } from '@ember/component/helper';

export function getAlternativeCountByLanguages([skill, language]) {
  const challenges = skill.validatedChallenges;
  return challenges.filter(challenge=>{
    return challenge.languages && challenge.languages.includes(language);
  }).length;
}

export default helper(getAlternativeCountByLanguages);
