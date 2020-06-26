import { helper } from '@ember/component/helper';

export function getAlternativeCountByLanguages([skill, language]) {
  let count = 0;
  const challenges = skill.productionChallenges;
  challenges.forEach(challenge=>{
    if(challenge.languages && challenge.languages.includes(language)){
      count ++;
    }
  });
  return count;
}

export default helper(getAlternativeCountByLanguages);
