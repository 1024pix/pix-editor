import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
  tagName:"",
  skillLink:computed("link", "skillMode", "production", "skill.template.content", function() {
    let skillMode = this.get("skillMode");
    let production = this.get("production");
    let link = this.get("link");
    let template = this.get("skill.template.content");
    if (skillMode) {
      return "competence.skill";
    }
    if (production && template) {
      return link;
    }
    return "competence.templates.list";
  }),
  skillLinkElement:computed("skillMode", "production", "skill.template.content", function() {
    let skillMode = this.get("skillMode");
    let production = this.get("production");
    let template = this.get("skill.template.content");
    if (skillMode) {
      return this.get("skill");
    }
    if (production && template) {
      return template;
    }
    return this.get("skill");
  })

});
