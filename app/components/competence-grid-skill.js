import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
  tagName:"",
  skillLink:computed("link", "skillMode","qualityMode", "production", "skill.productionTemplate", function() {
    let skillMode = this.get("skillMode");
    let qualityMode = this.get("qualityMode");
    let production = this.get("production");
    let link = this.get("link");
    let template = this.get("skill.productionTemplate");
    if (skillMode || qualityMode) {
      return "competence.skill.index";
    }
    if ((production && template)) {
      return link;
    }
    return "competence.templates.list";
  }),
  skillLinkElement:computed("skillMode","qualityMode", "production", "skill.productionTemplate", function() {
    let skillMode = this.get("skillMode");
    let qualityMode = this.get("qualityMode");
    let production = this.get("production");
    let template = this.get("skill.productionTemplate");
    if (skillMode || qualityMode) {
      return this.get("skill");
    }
    if (production && template) {
      return template;
    }
    return this.get("skill");
  })
});
