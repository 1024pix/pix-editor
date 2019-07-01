import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
  tagName:"",
  truthyColor:computed("skill.productionTemplate.spoil",
    "skill.productionTemplate.responsive",
    "skill.productionTemplate.accessibility1",
    "skill.productionTemplate.accessibility2",
    "skill.clueStatus", function(){
      const spoil = this.get("skill.productionTemplate.spoil");
      const spoilWeight = function(){
        if (spoil === "Non Sp") {
          return 3
        }
        if (spoil === "Difficilement Sp") {
          return 2
        }
        if (spoil === "Facilement Sp") {
          return 1
        }
        return 0
      };
      const responsive =  this.get("skill.productionTemplate.responsive");
      const responsiveWeight = function(){
        if (responsive === "Tablette") {
          return 1
        }
        if (responsive === "Smartphone") {
          return 1
        }
        if (responsive === "Tablette/Smartphone") {
          return 2
        }
        return 0
      };
      const colorblind = this.get('skill.productionTemplate.accessibility2');
      const colorblindWeight = function(){
        if (colorblind === "RAS" || colorblind === "OK") {
          return 1
        }
        return 0
      };
      const a11Y = this.get('skill.productionTemplate.accessibility1');
      const a11YWeight = function(){
        if (a11Y === "RAS" || a11Y === "OK") {
          return 2
        }
        if (a11Y === "Acquis Non Pertinent") {
          return 2
        }
        if (a11Y === 'KO') {
          return 0
        }
        return 1
      };
      const clue = this.get('skill.clueStatus');
      const clueWeight = function(){
        if (clue === 'Proposé') {
          return 2
        }
        if (clue === "Validé") {
          return 4
        }
        if (clue === "pré-validé") {
          return 3
        }
        if (clue === "à soumettre") {
          return 2
        }
        if (clue === "à retravaillé") {
          return 1
        }
        if (clue === "archiver") {
          return 0
        }
        return 0
      };
      const result = (spoilWeight()*5/3 + responsiveWeight()*2 +colorblindWeight()*3 + a11YWeight()*3/2 + clueWeight())/19
      return result.toFixed(2)
    }),
  haveTutorial:computed("skill.tutoSolutionCount", "skill.tutoMoreCount", function(){
    const tutoSolution = this.get('skill.tutoSolutionCount');
    const tutoMore = this.get('skill.tutoMoreCount');
    if(tutoSolution>0 && tutoMore>0){
      return 'black'
    }
    if(tutoSolution>0 || tutoMore>0){
      return 'grey'
    }
    return false
  }),
});
