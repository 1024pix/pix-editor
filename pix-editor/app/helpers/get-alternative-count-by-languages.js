import { helper } from '@ember/component/helper';

export default helper(function getAlternativeCountByLanguages([skill, languages]) {
  let count = 0;
  const challenges = skill.productionChallenges;
  challenges.forEach(challenge=>{
    if(challenge.languages && _equalArray(languages, challenge.languages)){
      count ++;
    }
  });
  return count;
});

function _equalArray(array, compare) {
  if(!array){
    return false;
  }
  if (array.length !== compare.length) {
    return false;
  }
  for (let i = 0; i < compare.length; i++) {
    if (!array.includes(compare[i])) {
      return false;
    }
  }
  return true;
}
