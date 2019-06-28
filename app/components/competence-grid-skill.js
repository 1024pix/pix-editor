import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
  tagName:"",
  skillLink:computed("link", "skillMode", "production", "skill.productionTemplate", function() {
    let skillMode = this.get("skillMode");
    let production = this.get("production");
    let link = this.get("link");
    let template = this.get("skill.productionTemplate");
    if (skillMode) {
      return "competence.skill.index";
    }
    if (production && template) {
      return link;
    }
    return "competence.templates.list";
  }),
  skillLinkElement:computed("skillMode", "production", "skill.productionTemplate", function() {
    let skillMode = this.get("skillMode");
    let production = this.get("production");
    let template = this.get("skill.productionTemplate");
    if (skillMode) {
      return this.get("skill");
    }
    if (production && template) {
      return template;
    }
    return this.get("skill");
  }),
  isItSpoilable:computed("skill.productionTemplate.spoil", function(){
    let spoil = this.get("skill.productionTemplate.spoil");
    if(spoil === "Non Sp"){
      return "not-sp"
    }
    if(spoil === "Difficilement Sp"){
      return "hard-sp"
    }
    if(spoil === "Facilement Sp"){
      return 'easy-sp'
    }
    return 'is-sp'
  }),
  isItResponsive:computed("skill.productionTemplate.responsive", function(){
    let responsive =  this.get("skill.productionTemplate.responsive");
    if(responsive === "Tablette"){
      return "tab-r"
    }
    if(responsive === "Smartphone"){
      return 'phone-r'
    }
    if(responsive === "Tablette/Smartphone"){
      return "tab-phone-r"
    }
    return "not-r"
  }),
  isItA11Y:computed("skill.productionTemplate.accessibility1", function(){
    let a11Y = this.get('skill.productionTemplate.accessibility1');
    if(a11Y === "RAS" || a11Y === "OK"){
      return "ok-blind"
    }
    if(a11Y === "Acquis Non Pertinent"){
      return "not-relevant-blind"
    }
    if(a11Y === 'KO'){
      return "not-blind"
    }
    return "to-test-blind"
  }),
  isItColorblind:computed("skill.productionTemplate.accessibility2", function(){
    let a11Y = this.get('skill.productionTemplate.accessibility2');
    if(a11Y === "RAS" || a11Y === "OK"){
      return "ok-colorblind"
    }
    return "not-colorblind"
  }),
  isItClue:computed("skill.clueStatus", function(){
    let clue = this.get('skill.clueStatus');
    if(clue === 'Proposé'){
      return "waiting-clue"
    }
    if(clue === "Validé"){
      return "ok-clue"
    }
    if(clue ==="pré-validé"){
      return "light-ok-clue"
    }
    if(clue === "à soumettre"){
      return "propose-clue"
    }
    if(clue === "à retravaillé"){
      return "reworked-clue"
    }
    if(clue === "archiver"){
      return "archive-clue"
    }
      return "not-clue"
  }),
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
      return spoilWeight()*5/3 + responsiveWeight()*2 +colorblindWeight()*3 + a11YWeight()*3/2 + clueWeight()
    })
});
