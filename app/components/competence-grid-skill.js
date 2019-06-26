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
  })

});
